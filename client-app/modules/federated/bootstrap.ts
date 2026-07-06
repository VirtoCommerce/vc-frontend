import { Logger } from "@/core/utilities";
import { isMfFlagEnabled } from "@/core-api/federation.mjs";

/**
 * App-runner entry for Module Federation. Kept free of static MF-runtime
 * imports: the loader (./index) is imported dynamically and only when APP_MODULES_FEDERATION_ENABLED is
 * set, so non-MF builds bundle neither the runtime nor the loader.
 */

/**
 * Upper bound on how long BOOT may wait for the whole loader. The per-phase budgets in
 * ./index bound each step (5s manifest, 10s load, 10s init), but they CHAIN: a remote
 * whose manifest answers fast, loads slowly and then hangs in init() holds first paint
 * for their sum (~25s of blank page). This caps the aggregate: past it, boot proceeds
 * and the loader finishes detached — a straggler behaves like the documented init
 * overrun (its routes may register after the first navigation; outcome still reported
 * by the loader's own logging/telemetry when it settles).
 */
const BOOT_BUDGET_MS = 10_000;
const BUDGET_EXCEEDED = Symbol("mf-boot-budget-exceeded");

export async function startFederatedModules(): Promise<void> {
  if (!isMfFlagEnabled(import.meta.env.APP_MODULES_FEDERATION_ENABLED)) {
    return;
  }
  try {
    const { initFederatedModules } = await import("./index");
    const work = initFederatedModules();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const budget = new Promise<typeof BUDGET_EXCEEDED>((resolve) => {
      timer = setTimeout(() => resolve(BUDGET_EXCEEDED), BOOT_BUDGET_MS);
    });
    try {
      const outcome = await Promise.race([work, budget]);
      if (outcome === BUDGET_EXCEEDED) {
        Logger.warn(
          `[MF] federated loader exceeded the ${BOOT_BUDGET_MS}ms boot budget - continuing boot without waiting; late plugins may register routes after the first navigation`,
        );
      }
    } finally {
      clearTimeout(timer);
    }
  } catch (error) {
    // The app-runner awaits this before installing the router — a loader chunk-load
    // failure must degrade to "no plugins", never break boot.
    Logger.error("[MF] Federated loader failed to start", error);
  }
}
