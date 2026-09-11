import { Logger } from "@/core/utilities";
import { ignoreChunkLoadFailure } from "@/core/utilities/optional-chunk";
import { isFederationEnabled } from "./enabled";
import type { IFederatedLoaderOptions, IPlatformPlugin } from "./index";

interface IStartOptions extends Pick<IFederatedLoaderOptions, "hasPermission"> {
  /** A function, not a list, so the flag check below is the only thing that can issue the query. */
  fetchPlugins?: () => Promise<readonly IPlatformPlugin[] | undefined>;
}

/**
 * App-runner entry for Module Federation. Kept free of static MF-runtime
 * imports: the loader (./index) is imported dynamically and only when the host is enabled (build flag
 * AND theme setting, see ./enabled), so non-MF builds bundle neither the runtime nor the loader.
 */

/**
 * Outer cap for what the per-phase budgets cannot cover: this loader's own chunk fetch (deliberately
 * unbudgeted) and a malfunctioning inner timeout. Must exceed the budgeted legs — discovery 2 +
 * manifest 2 + 2×load 3 = 10s — leaving 2s for the chunk fetch. Past it boot proceeds and the loader
 * finishes detached, so late plugins may register routes after the first navigation.
 * Full reasoning: README, "The load sequence" -> "Every network step is time-budgeted".
 */
// Exported for the invariant test only (backstop > discovery + manifest + 2×load defaults).
export const BOOT_BACKSTOP_MS = 12_000;

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
  if (!isFederationEnabled()) {
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
