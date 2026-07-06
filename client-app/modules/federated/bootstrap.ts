import { Logger } from "@/core/utilities";
import { isMfFlagEnabled } from "@/core-api/federation.mjs";

/**
 * App-runner entry for Module Federation. Kept free of static MF-runtime
 * imports: the loader (./index) is imported dynamically and only when APP_MODULES_FEDERATION_ENABLED is
 * set, so non-MF builds bundle neither the runtime nor the loader.
 */
export async function startFederatedModules(): Promise<void> {
  if (!isMfFlagEnabled(import.meta.env.APP_MODULES_FEDERATION_ENABLED)) {
    return;
  }
  try {
    const { initFederatedModules } = await import("./index");
    await initFederatedModules();
  } catch (error) {
    // The app-runner awaits this before installing the router — a loader chunk-load
    // failure must degrade to "no plugins", never break boot.
    Logger.error("[MF] Federated loader failed to start", error);
  }
}
