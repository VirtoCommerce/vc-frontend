import { IS_DEVELOPMENT } from "@/core/constants";
import { Logger } from "@/core/utilities/logger";
import { cache } from "./cache";
import type { TypePolicies } from "@apollo/client/core";

const registeredTypenames = new Set<string>();

/**
 * Adds type policies to the host's Apollo cache. Exposed to Module Federation plugins
 * through `@vc-frontend/core` so a plugin can normalize its own GraphQL types without
 * importing the cache instance.
 *
 * Call before the plugin issues its first query — policies do not apply retroactively
 * to data already in the cache.
 */
export function registerCacheTypePolicies(policies: TypePolicies): void {
  if (IS_DEVELOPMENT) {
    warnOnLateRegistration(policies);
    warnOnConflictingRegistration(policies);
  }

  cache.policies.addTypePolicies(policies);
}

function warnOnLateRegistration(policies: TypePolicies): void {
  const normalized = Object.keys(cache.extract());
  const late = Object.keys(policies).filter((typename) => normalized.some((key) => key.startsWith(`${typename}:`)));

  if (late.length) {
    Logger.warn(
      `registerCacheTypePolicies: ${late.join(", ")} already normalized in the cache. Policies do not apply retroactively, so those entries keep their existing keys until the cache is reset.`,
    );
  }
}

function warnOnConflictingRegistration(policies: TypePolicies): void {
  const typenames = Object.keys(policies);
  const repeated = typenames.filter((typename) => registeredTypenames.has(typename));

  if (repeated.length) {
    Logger.warn(
      `registerCacheTypePolicies: ${repeated.join(", ")} already registered by another caller. Apollo keeps the last keyFields it is given, so the earlier policy is replaced without an error.`,
    );
  }

  typenames.forEach((typename) => registeredTypenames.add(typename));
}
