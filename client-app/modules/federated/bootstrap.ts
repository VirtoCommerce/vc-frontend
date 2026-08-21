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
 * a remote may legally take up to manifest + 2×load, 13s with the 3s/5s defaults)
 * already bound how long a compliant remote can hold boot. This outer cap exists for
 * what those budgets cannot cover — the fetch of the loader chunk itself hanging, or
 * an inner timeout malfunctioning — so it must stay ABOVE the per-phase sum: a remote
 * operating within its budgets must never trip it (its routes are guaranteed to exist
 * for the first navigation). Past the backstop, boot proceeds and the loader finishes
 * detached: late plugins may register routes after the first navigation, and the only
 * signal is dev logging — production telemetry is a tracked stage-2 follow-up
 * (TODO.md), so a backstop overrun currently leaves NO prod signal.
 */
// Exported for the invariant test only (backstop > manifest + 2×load defaults).
export const BOOT_BACKSTOP_MS = 20_000;

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
        options?.fetchPlugins?.().catch((error) => {
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
