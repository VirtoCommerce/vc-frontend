import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { ignoreChunkLoadFailure } from "@/core/utilities/optional-chunk";
import { isFederationEnabled } from "./enabled";
import type { IFederatedLoaderOptions, IPlatformPlugin } from "./index";

interface IStartOptions extends Pick<IFederatedLoaderOptions, "hasPermission" | "conditionContext"> {
  /** A function, not a list, so the flag check below is the only thing that can issue the query. */
  fetchPlugins?: () => Promise<readonly IPlatformPlugin[] | undefined>;
}

/**
 * App-runner entry for Module Federation. Kept free of static MF-runtime
 * imports: the loader (./index) is imported dynamically and only when the theme enables federation
 * (see ./enabled). In a switch-off build `__MF_HOST__` is `false`, so that import, the loader and the
 * MF runtime are not bundled at all.
 */

/**
 * Outer cap for what the per-phase budgets cannot cover: this loader's own chunk fetch (deliberately
 * unbudgeted) and a malfunctioning inner timeout. Must exceed the budgeted legs — discovery, an env
 * remote's plugin.json, then its manifest, load and init — and what is left over is the chunk fetch's
 * headroom; the backstop invariant test holds the sum. Past it boot proceeds and the loader
 * finishes detached; `reResolveOnceSettled` then moves a user off a 404 onto a route that appeared.
 * Bounds the plugins that set `blocksBoot` only; boot waits for no other plugin's code.
 * Full reasoning: README, "The load sequence" -> "Every network step is time-budgeted".
 */
// Exported for the backstop invariant test only.
export const BOOT_BACKSTOP_MS = 14_000;

/** Re-resolves the current URL once every plugin settled: a deep link may have hit the catch-all before its route existed. */
function reResolveOnceSettled(): void {
  const router = globals.router;
  if (!router) {
    return;
  }
  const current = router.currentRoute.value;
  // Router not installed yet.
  if (current.matched.length === 0) {
    return;
  }
  const next = router.resolve(current.fullPath);
  if (next.name !== current.name) {
    void router.replace({ path: current.path, query: current.query, hash: current.hash, force: true });
  }
}

/** Budget for the plugin list; without one it was the only unbudgeted leg inside the backstop. */
export const DISCOVERY_TIMEOUT_MS = 2_000;

/**
 * Resolves to `undefined` (no plugins) rather than rejecting when the list is slow — a discovery
 * stall must cost the plugins, never the boot. Kept local: bootstrap stays free of ./index imports
 * so a non-MF build bundles neither the loader nor the MF runtime.
 */
async function withDiscoveryBudget(
  fetchPlugins: IStartOptions["fetchPlugins"],
): Promise<readonly IPlatformPlugin[] | undefined> {
  if (!fetchPlugins) {
    Logger.warn("[MF] no plugin-list source was passed - platform discovery is off");
    return undefined;
  }
  let timer: ReturnType<typeof setTimeout> | undefined;
  const budget = new Promise<undefined>((resolve) => {
    timer = setTimeout(() => {
      Logger.warn(
        `[MF] the platform's plugin list did not answer within ${DISCOVERY_TIMEOUT_MS}ms - continuing without plugins`,
      );
      resolve(undefined);
    }, DISCOVERY_TIMEOUT_MS);
  });
  try {
    return await Promise.race([fetchPlugins(), budget]);
  } finally {
    clearTimeout(timer);
  }
}

export async function startFederatedModules(options?: IStartOptions): Promise<void> {
  if (!__MF_HOST__ || !isFederationEnabled()) {
    return;
  }
  let timer: ReturnType<typeof setTimeout> | undefined;
  // Started BEFORE the dynamic import so the backstop covers the loader-chunk fetch
  // too — a stalled (never-settling) chunk request must not hold boot past the cap.
  const backstop = new Promise<void>((resolve) => {
    timer = setTimeout(() => {
      Logger.warn(
        `[MF] federated loader exceeded the ${BOOT_BACKSTOP_MS}ms boot backstop - continuing boot without waiting; late plugins may register routes after the first navigation`,
      );
      resolve();
    }, BOOT_BACKSTOP_MS);
  });
  // Failures are handled INSIDE `work`, so a loader-chunk error logs the same single
  // line before or after the backstop (a catch around the race would silently absorb
  // post-backstop rejections). `work` never rejecting also means a loader failure
  // degrades to "no plugins" and can never break boot.
  const work = (async () => {
    try {
      const [plugins, { prepareFederatedModules, loadPreparedModules }] = await Promise.all([
        withDiscoveryBudget(options?.fetchPlugins).catch((error) => {
          Logger.error("[MF] Could not read the platform's plugin list", error);
          return undefined;
        }),
        import("./index"),
      ]);
      const prepared = await prepareFederatedModules({
        plugins,
        hasPermission: options?.hasPermission,
        conditionContext: options?.conditionContext,
      });
      const { blocking, all } = loadPreparedModules(prepared);
      void all.then(reResolveOnceSettled);
      await blocking;
    } catch (error) {
      // A loader-chunk fetch failure degrades to "no plugins" here, not to a reload.
      ignoreChunkLoadFailure(error);
      Logger.error("[MF] Federated loader failed to start", error);
    }
  })();
  try {
    await Promise.race([work, backstop]);
  } finally {
    clearTimeout(timer);
  }
}
