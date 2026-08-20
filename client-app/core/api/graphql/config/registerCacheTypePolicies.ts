import { IS_DEVELOPMENT } from "@/core/constants";
import { Logger } from "@/core/utilities/logger";
import { cache, hostTypePolicies } from "./cache";
import type { TypePolicies } from "@apollo/client/core";

/** Who holds a typename's policy, and how hard. A collision is decided by priority, not by order. */
export type CacheTypePolicyOwnerType = {
  owner: string;
  priority: number;
};

export type CacheTypePolicyRejectionType = CacheTypePolicyOwnerType & {
  typename: string;
  heldBy: CacheTypePolicyOwnerType;
};

export type CacheTypePoliciesDebugType = {
  /** typename -> who currently owns its policy. */
  owners: Map<string, CacheTypePolicyOwnerType>;
  /** Every registration that was refused, in order. */
  rejected: CacheTypePolicyRejectionType[];
};

const HOST_OWNER = "host";
/** The host outranks every plugin: its policies are the ones the storefront itself depends on. */
const HOST_PRIORITY = 100;

const owners = new Map<string, CacheTypePolicyOwnerType>(
  Object.keys(hostTypePolicies).map((typename) => [typename, { owner: HOST_OWNER, priority: HOST_PRIORITY }]),
);

const rejected: CacheTypePolicyRejectionType[] = [];

/**
 * Adds type policies to the host's Apollo cache. Exposed to Module Federation plugins
 * through `@vc-frontend/core` so a plugin can normalize its own GraphQL types without
 * importing the cache instance.
 *
 * Call before the plugin issues its first query — policies do not apply retroactively
 * to data already in the cache.
 *
 * One typename, one owner: Apollo would let a later `keyFields` replace an earlier one silently,
 * so a registration that collides with a policy held at an equal or higher priority is REFUSED
 * (the rest of the batch still applies). Pass `owner` so the refusal names someone, and `priority`
 * only when a plugin is deliberately meant to outrank another. The host's own policies sit at
 * {@link HOST_PRIORITY}, so no plugin can take one over.
 *
 * In development the ownership map and every refusal are readable as `window.modulesCacheDebug`.
 */
export function registerCacheTypePolicies(
  policies: TypePolicies,
  { owner = "unknown", priority = 0 }: { owner?: string; priority?: number } = {},
): void {
  const accepted: TypePolicies = {};

  for (const [typename, policy] of Object.entries(policies)) {
    const heldBy = owners.get(typename);

    if (heldBy && heldBy.priority >= priority) {
      rejected.push({ typename, owner, priority, heldBy });
      Logger.warn(
        `registerCacheTypePolicies: "${owner}" (priority ${priority}) cannot take over "${typename}" — ` +
          `"${heldBy.owner}" holds it at priority ${heldBy.priority}. The existing policy is kept.`,
      );
      continue;
    }

    accepted[typename] = policy;
    owners.set(typename, { owner, priority });
  }

  const acceptedTypenames = Object.keys(accepted);

  if (!acceptedTypenames.length) {
    return;
  }

  if (IS_DEVELOPMENT) {
    warnOnLateRegistration(acceptedTypenames);
  }

  cache.policies.addTypePolicies(accepted);
}

function warnOnLateRegistration(typenames: string[]): void {
  const normalized = Object.keys(cache.extract());
  const late = typenames.filter((typename) => normalized.some((key) => key.startsWith(`${typename}:`)));

  if (late.length) {
    Logger.warn(
      `registerCacheTypePolicies: ${late.join(", ")} already normalized in the cache. Policies do not apply retroactively, so those entries keep their existing keys until the cache is reset.`,
    );
  }
}

// To debug in development mode
if (IS_DEVELOPMENT) {
  window.modulesCacheDebug = { owners, rejected };
}
