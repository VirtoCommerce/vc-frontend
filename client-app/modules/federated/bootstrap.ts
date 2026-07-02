/**
 * App-runner entry for Module Federation (VCST-5159). Kept free of static MF-runtime
 * imports: the loader (./index) is imported dynamically and only when APP_MF_HOST is
 * set, so non-MF builds bundle neither the runtime nor the loader.
 */
export function startFederatedModules(): Promise<unknown> {
  if (!import.meta.env.APP_MF_HOST) {
    return Promise.resolve();
  }
  return import("./index").then(({ initFederatedModules }) => initFederatedModules());
}
