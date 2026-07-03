import { version } from "./package.json";

/**
 * Version of the `@vc-frontend/core` public contract (VCST-5159, #2), single-sourced
 * from core-api/package.json. Federated plugins declare the contract version/range
 * they were built against in their manifest (`metaData.requiredHostVersion`); the
 * host loader compares it to this value and refuses to load an incompatible plugin
 * before any of its code runs. Managed by `yarn build:core-types` (auto minor bump)
 * and `yarn bump:core major` - do not edit the version by hand.
 */
export const CORE_VERSION: string = version;
