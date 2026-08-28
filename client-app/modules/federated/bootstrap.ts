import { Logger } from "@/core/utilities";
import { ignoreChunkLoadFailure } from "@/core/utilities/optional-chunk";
import { isMfFlagEnabled } from "@/core-api/federation.mjs";
import type { IFederatedLoaderOptions, IPlatformPlugin } from "./index";

interface IStartOptions extends Pick<IFederatedLoaderOptions, "hasPermission"> {
  /** A function, not a list, so the flag check below is the only thing that can issue the query. */
  fetchPlugins?: () => Promise<readonly IPlatformPlugin[] | undefined>;
}

/**
 * App-runner entry for Module Federation. Kept free of static MF-runtime
 * imports: the loader (./index) is imported dynamically and only when APP_MODULES_FEDERATION_ENABLED is
 * set, so non-MF builds bundle neither the runtime nor the loader.
 */

/**
 * BACKSTOP, not a budget: the loader's own per-phase budgets (./index — two knobs;
 * a remote may legally take up to manifest + 2×load, 8s with the 2s/3s defaults),
 * plus DISCOVERY_TIMEOUT_MS for the plugin list, already bound how long a compliant
 * remote can hold boot. This outer cap exists for what those budgets cannot cover —
 * the fetch of THIS loader's own chunk hanging, or an inner timeout malfunctioning — so
 * it must stay above the sum of all the budgeted legs: 2 + 2 + 3 + 3 = 10s of the 12s.
 *
 * Which is the honest statement of the guarantee, and it is narrower than "never":
 * the remaining 2s is all the headroom the UNBUDGETED loader-chunk fetch gets. A
 * budget-compliant remote behind a chunk fetch slower than that can still trip the cap.
 * Deliberately not given a budget of its own: bounding it IS what this backstop is for,
 * and a second timer would only mean dropping every plugin sooner on a slow connection.
 * Widen the cap, not the promise, if that 2s ever proves too tight.
 *
 * Past the backstop, boot proceeds and the loader finishes
 * detached: late plugins may register routes after the first navigation, and the only
 * signal is dev logging — production telemetry is a tracked stage-2 follow-up
 * (TODO.md), so a backstop overrun currently leaves NO prod signal.
 */
// Exported for the invariant test only (backstop > discovery + manifest + 2×load defaults).
export const BOOT_BACKSTOP_MS = 12_000;

/**
 * The plugin list is a network read like any other, so it gets a budget of its own. Without one it
 * was the single unbudgeted leg inside the backstop's race: a cold backend answering `store.plugins`
 * slowly plus a remote spending its full, legal manifest + 2×load allowance summed past the cap, so
 * the backstop fired on a compliant plugin and boot continued without its routes — exactly what the
 * backstop is documented never to do. app-runner starts this query alongside the other boot queries,
 * so by the time the loader awaits it it has usually resolved already; this bounds the cold case.
 */
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
  if (!isMfFlagEnabled(import.meta.env.APP_MODULES_FEDERATION_ENABLED)) {
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
      const [plugins, { initFederatedModules }] = await Promise.all([
        withDiscoveryBudget(options?.fetchPlugins).catch((error) => {
          Logger.error("[MF] Could not read the platform's plugin list", error);
          return undefined;
        }),
        import("./index"),
      ]);
      await initFederatedModules({ plugins, hasPermission: options?.hasPermission });
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
