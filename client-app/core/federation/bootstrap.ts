import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { ignoreChunkLoadFailure } from "@/core/utilities/optional-chunk";
import { PLACEHOLDER_META_KEY } from "./contributions/placeholder";
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
 * unbudgeted) and a malfunctioning inner timeout. Starts once the plugin list is in. Must exceed the
 * budgeted legs — an env remote's plugin.json, then its manifest, load and init — and what is left
 * over is the chunk fetch's headroom; the backstop invariant test holds the sum. Past it boot proceeds and the loader
 * finishes detached; `reResolveOnceSettled` then moves a user off a 404 onto a route that appeared.
 * Bounds the plugins that set `blocksBoot` only; boot waits for no other plugin's code.
 * Full reasoning: README, "The load sequence" -> "Every plugin step is time-budgeted".
 */
// Exported for the backstop invariant test only.
export const BOOT_BACKSTOP_MS = 30_000;

/** Re-resolves the current URL once every plugin settled: a deep link may have hit the catch-all before its route existed. */
async function reResolveOnceSettled(): Promise<void> {
  const router = globals.router;
  if (!router) {
    return;
  }
  // The first navigation resolves its target before it finishes: until then `currentRoute` is the
  // start location, and a route added meanwhile is missed by both that navigation and this check.
  try {
    await router.isReady();
  } catch {
    // A failed first navigation is reported where app-runner awaits the same `isReady()`.
    return;
  }
  const current = router.currentRoute.value;
  // A declared route's placeholder resolves itself, and a failed plugin's reload offer must not become a 404.
  if (current.matched.at(-1)?.meta?.[PLACEHOLDER_META_KEY] !== undefined) {
    return;
  }
  const next = router.resolve(current.fullPath);
  if (next.name !== current.name) {
    void router.replace({ path: current.path, query: current.query, hash: current.hash, force: true });
  }
}

/**
 * The plugin list is an ordinary boot request, started with the store and page context and awaited
 * like them, with no budget of its own: cutting it short would drop every plugin on a slow network.
 * Never rejects — an unreadable list degrades to no plugins.
 */
async function readPluginList(
  fetchPlugins: IStartOptions["fetchPlugins"],
): Promise<readonly IPlatformPlugin[] | undefined> {
  if (!fetchPlugins) {
    Logger.warn("[MF] no plugin-list source was passed - platform discovery is off");
    return undefined;
  }
  try {
    return await fetchPlugins();
  } catch (error) {
    Logger.error("[MF] Could not read the platform's plugin list", error);
    return undefined;
  }
}

export async function startFederatedModules(options?: IStartOptions): Promise<void> {
  if (!__MF_HOST__ || !isFederationEnabled()) {
    return;
  }
  // Fetched alongside the plugin list. Settled by `work`; the no-op catch only keeps a rejection that
  // lands before `work` awaits it from being reported as unhandled.
  const loader = import("./index");
  void loader.catch(() => undefined);
  const plugins = await readPluginList(options?.fetchPlugins);

  let timer: ReturnType<typeof setTimeout> | undefined;
  // Started after the list, which the backstop does not bound, and before the loader chunk is awaited,
  // so a stalled chunk request still cannot hold boot past the cap.
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
      const { prepareFederatedModules, loadPreparedModules } = await loader;
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
