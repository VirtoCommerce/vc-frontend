import { IS_DEVELOPMENT } from "@/core/constants";
import { Logger } from "@/core/utilities/logger";
import { cache, hostTypePolicies } from "./cache";
import type { TypePolicies, TypePolicy } from "@apollo/client/core";

/** Who holds a claim, and how hard. A collision is decided by priority, not by order. */
export type CacheTypePolicyOwnerType = {
  owner: string;
  priority: number;
};

export type CacheTypePolicyRejectionType = CacheTypePolicyOwnerType & {
  /** The refused claim: `Typename` for a type-level one, `Typename.field` for a single field. */
  typename: string;
  heldBy: CacheTypePolicyOwnerType;
};

export type CacheTypePoliciesDebugType = {
  /** claim -> who owns it, keyed like {@link CacheTypePolicyRejectionType.typename}. */
  owners: Map<string, CacheTypePolicyOwnerType>;
  /** Every registration that was refused, in order. */
  rejected: CacheTypePolicyRejectionType[];
};

const HOST_OWNER = "host";
/** The host outranks every plugin: its policies are the ones the storefront itself depends on. */
const HOST_PRIORITY = 100;

/** Apollo keeps root-type fields under these ids; a root type never becomes a `Query:<id>` entity. */
const ROOT_IDS: Record<string, string | undefined> = {
  Query: "ROOT_QUERY",
  Mutation: "ROOT_MUTATION",
  Subscription: "ROOT_SUBSCRIPTION",
};

/**
 * The claims a policy actually makes, at the granularity Apollo merges at.
 *
 * `addTypePolicies` merges `fields` PER FIELD NAME — a field policy is replaced only when the same
 * field is registered twice — while `keyFields` and a type-level `merge` replace wholesale. So
 * owning a whole typename because of one `Query.aList` policy would lock out every later plugin's
 * unrelated `Query.bList`, a refusal that protects nothing since Apollo would have merged the two
 * additively.
 */
function claimsOf(typename: string, policy: TypePolicy): { key: string; typeLevel: boolean }[] {
  const { fields, ...typeLevel } = policy;
  return [
    ...(Object.keys(typeLevel).length ? [{ key: typename, typeLevel: true }] : []),
    ...Object.keys(fields ?? {}).map((field) => ({ key: `${typename}.${field}`, typeLevel: false })),
  ];
}

const owners = new Map<string, CacheTypePolicyOwnerType>(
  Object.entries(hostTypePolicies).flatMap(([typename, policy]) =>
    claimsOf(typename, policy ?? {}).map(({ key }) => [key, { owner: HOST_OWNER, priority: HOST_PRIORITY }] as const),
  ),
);

const rejected: CacheTypePolicyRejectionType[] = [];

/**
 * What blocks a claim, if anything. Deliberately ASYMMETRIC:
 *
 * - a TYPE-LEVEL claim (`keyFields`, type-level `merge`) re-keys the whole entity, so it collides
 *   with the typename AND with every field claim under it. Without this a host policy made only of
 *   `fields` — which is most of them — would leave its typename formally unclaimed and a plugin
 *   could redefine how the host identifies it;
 * - a FIELD claim touches one field, so it collides only with that field and with a type-level
 *   claim on the typename.
 *
 * The same owner re-registering its own claim is never a collision: HMR and a second `init()` both
 * land here, and reporting that as a conflict points the reader at a second plugin that does not
 * exist.
 */
function blockedBy(typename: string, key: string, typeLevel: boolean, owner: string, priority: number) {
  const prefix = `${typename}.`;
  for (const [held, by] of owners) {
    const collides = typeLevel ? held === typename || held.startsWith(prefix) : held === key || held === typename;
    if (collides && by.owner !== owner && by.priority >= priority) {
      return by;
    }
  }
  return undefined;
}

/**
 * Takes the claims nobody else holds and returns the part of the policy that may be applied, so a
 * refused claim costs only itself — the rest of the policy, and the rest of the batch, still lands.
 */
function claimWhatIsFree(typename: string, policy: TypePolicy, owner: string, priority: number): TypePolicy {
  const { fields, ...typeLevel } = policy;
  const acceptedPolicy: TypePolicy = {};

  for (const claim of claimsOf(typename, policy)) {
    const heldBy = blockedBy(typename, claim.key, claim.typeLevel, owner, priority);
    if (heldBy) {
      if (IS_DEVELOPMENT) {
        rejected.push({ typename: claim.key, owner, priority, heldBy });
      }
      Logger.warn(
        `registerCacheTypePolicies: "${owner}" (priority ${priority}) cannot take over "${claim.key}" — ` +
          `"${heldBy.owner}" holds it at priority ${heldBy.priority}. The existing policy is kept.`,
      );
      continue;
    }

    if (claim.typeLevel) {
      Object.assign(acceptedPolicy, typeLevel);
    } else {
      const field = claim.key.slice(typename.length + 1);
      const fieldPolicy = fields?.[field];
      // An explicitly-undefined field policy claims nothing, so it takes no ownership either.
      if (fieldPolicy === undefined) {
        continue;
      }
      acceptedPolicy.fields = { ...acceptedPolicy.fields, [field]: fieldPolicy };
    }
    owners.set(claim.key, { owner, priority });
  }

  return acceptedPolicy;
}

/**
 * Adds type policies to the host's Apollo cache. Exposed to Module Federation plugins through
 * `@vc-frontend/core` so a plugin can normalize its own GraphQL types without importing the cache.
 *
 * Call before the plugin issues its first query — policies do not apply retroactively to data
 * already in the cache. Registering late is warned about in development, not refused.
 *
 * One claim, one owner, at the granularity Apollo merges at (see {@link claimsOf} and
 * {@link blockedBy}). A claim held at an equal or higher priority is refused, and only that claim —
 * the rest of the policy, and the rest of the batch, still applies. Pass `owner` so a refusal names
 * someone, and `priority` only when a plugin is deliberately meant to outrank another. The host's
 * own policies sit at {@link HOST_PRIORITY}, so no plugin can take one over.
 *
 * WHAT THIS DOES NOT PROTECT: only the policies the host DECLARES are reserved. The host stores far
 * more typenames than it writes policies for — anything Apollo normalizes by its default `id` rule
 * holds no policy and is therefore unclaimed, so a plugin registering `keyFields` for one of those
 * is accepted. The check is a collision guard between declared policies, not a fence around the
 * host's whole cache surface.
 *
 * In development the ownership map and every refusal are readable as `window.modulesCacheDebug`.
 */
export function registerCacheTypePolicies(
  policies: TypePolicies,
  { owner = "unknown", priority = 0 }: { owner?: string; priority?: number } = {},
): void {
  const accepted: TypePolicies = {};

  for (const [typename, policy] of Object.entries(policies)) {
    const acceptedPolicy = policy && claimWhatIsFree(typename, policy, owner, priority);
    if (acceptedPolicy && Object.keys(acceptedPolicy).length) {
      accepted[typename] = acceptedPolicy;
    }
  }

  if (!Object.keys(accepted).length) {
    return;
  }

  if (IS_DEVELOPMENT) {
    warnOnLateRegistration(accepted);
  }

  cache.policies.addTypePolicies(accepted);
}

/** Every `__typename` the cache holds, normalized entities and inline objects alike. */
function typenamesInCache(snapshot: unknown): Set<string> {
  const found = new Set<string>();
  const seen = new WeakSet<object>();
  const visit = (node: unknown): void => {
    if (!node || typeof node !== "object" || seen.has(node)) {
      return;
    }
    seen.add(node);
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    const record = node as Record<string, unknown>;
    if (typeof record.__typename === "string") {
      found.add(record.__typename);
    }
    Object.values(record).forEach(visit);
  };
  visit(snapshot);
  return found;
}

/**
 * `pluginList({"after":"x"})` and `pluginList:{"filter":"a"}` both belong to the field `pluginList`.
 * Cut at the first separator by index rather than with a `[(:].*$` replace: the trailing `.*$` is
 * what Sonar S8786 flags for super-linear backtracking, and a search-and-slice is both linear and
 * plainer about what it does.
 */
const FIELD_KEY_SEPARATOR = /[(:]/;

function storedFieldNames(rootEntry: unknown): Set<string> {
  if (!rootEntry || typeof rootEntry !== "object") {
    return new Set();
  }
  return new Set(
    Object.keys(rootEntry as Record<string, unknown>).map((key) => {
      const separator = key.search(FIELD_KEY_SEPARATOR);
      return separator === -1 ? key : key.slice(0, separator);
    }),
  );
}

/**
 * Registering after the data is stored is the silent failure this API exists to make loud, so the
 * detection has to cover the shapes it used to miss.
 *
 * A ROOT-TYPE policy never produces a `Query:` key — its fields live under `ROOT_QUERY` — so a late
 * `Query.fields.x.keyArgs`, the commonest hazard there is, warned about nothing while orphaning
 * everything already stored under the old field key. And a typename stored INLINE (no `id`) is
 * absent from the extract's top-level keys, so it was invisible too. Hence a per-field check
 * against the root entries plus a full walk for `__typename`.
 */
function warnOnLateRegistration(accepted: TypePolicies): void {
  const snapshot = cache.extract() as Record<string, unknown>;
  const present = typenamesInCache(snapshot);
  const late: string[] = [];

  for (const [typename, policy] of Object.entries(accepted)) {
    const rootId = ROOT_IDS[typename];
    if (rootId) {
      const stored = storedFieldNames(snapshot[rootId]);
      for (const field of Object.keys(policy?.fields ?? {})) {
        if (stored.has(field)) {
          late.push(`${typename}.${field}`);
        }
      }
      continue;
    }
    if (present.has(typename)) {
      late.push(typename);
    }
  }

  if (late.length) {
    Logger.warn(
      `registerCacheTypePolicies: ${late.join(", ")} already has data in the cache. Policies do not apply retroactively, so those entries keep their existing keys until the cache is reset.`,
    );
  }
}

// To debug in development mode
if (IS_DEVELOPMENT) {
  window.modulesCacheDebug = { owners, rejected };
}
