/**
 * Version of the `@vc-frontend/core` public contract (VCST-5159, #2).
 *
 * Federated plugins declare the minimum core version they were built against in
 * their manifest (`metaData.requiredHostVersion`); the host loader compares it to
 * this value and refuses to load an incompatible plugin instead of letting it fail
 * at runtime. Bump on any breaking change to the facade surface.
 *
 * Keep in sync with core-api/package.json `version`.
 */
export const CORE_VERSION = "2.53.0";
