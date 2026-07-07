import { Logger } from "@/core/utilities";
import { isMfFlagEnabled } from "@/core-api/federation.mjs";

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
const BOOT_BACKSTOP_MS = 20_000;

export async function startFederatedModules(): Promise<void> {
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
  try {
    const work = (async () => {
      const { initFederatedModules } = await import("./index");
      await initFederatedModules();
    })();
    await Promise.race([work, backstop]);
  } catch (error) {
    // The app-runner awaits this before installing the router — a loader chunk-load
    // failure must degrade to "no plugins", never break boot. (A rejection AFTER the
    // backstop fired is absorbed by the race's own subscription — and the loader
    // itself never rejects — so nothing is left unhandled on the detached path.)
    Logger.error("[MF] Federated loader failed to start", error);
  } finally {
    clearTimeout(timer);
  }
}
