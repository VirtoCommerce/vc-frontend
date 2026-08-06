import { cache } from "./cache";
import type { TypePolicies } from "@apollo/client/core";

/**
 * Adds type policies to the host's Apollo cache. Exposed to Module Federation plugins
 * through `@vc-frontend/core` so a plugin can normalize its own GraphQL types without
 * importing the cache instance.
 *
 * Call before the plugin issues its first query — policies do not apply retroactively
 * to data already in the cache.
 */
export function registerCacheTypePolicies(policies: TypePolicies): void {
  cache.policies.addTypePolicies(policies);
}
