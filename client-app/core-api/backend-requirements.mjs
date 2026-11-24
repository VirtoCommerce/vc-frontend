/**
 * The lowest backend a module shipping a storefront plugin must declare in its module.manifest. The
 * scaffolder prints these and check:plugin-module enforces them; docs name this constant, never the values.
 */
export const BACKEND_REQUIREMENTS = Object.freeze({
  /** Serves the `contributions` of a plugin.json. */
  platform: "3.1078.0",
  modules: Object.freeze({
    /** `store.plugins` with `contributions`: an older x-api rejects the host's plugin query, so no plugin loads. */
    "VirtoCommerce.Xapi": "3.1027.0",
    /** Declares the `vc-frontend` app whose plugins the platform probes for. */
    "VirtoCommerce.XFrontend": "3.1005.0",
  }),
});
