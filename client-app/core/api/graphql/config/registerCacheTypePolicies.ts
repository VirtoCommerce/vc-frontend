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
/**
 * The ceiling for a CALLER-supplied priority. The host seeds its own claims straight into `owners`
 * below, never through the public function, so capping here costs it nothing and makes the promise
 * in {@link registerCacheTypePolicies} true: escalation stays available plugin-vs-plugin, and
 * `>= HOST_PRIORITY` becomes unreachable from outside.
 */
const MAX_PLUGIN_PRIORITY = HOST_PRIORITY - 1;

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
 * exist. That exemption is why `owner` is VALIDATED rather than merely typed — an absent one would
 * make two unrelated plugins the same owner and exempt them from each other, and `"host"` would
 * walk straight past the host's own claims. Both are refused in {@link registerCacheTypePolicies}.
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
 * Every rank ever declared. A rank belongs to the OWNER, not to each individual claim: a plugin is
 * one actor, and two of its own claims sitting at different ranks is a state nothing here wants.
 *
 * Held separately from `owners` rather than read back out of it, because an owner can legitimately
 * hold NOTHING and still have a rank — its first registration collided, or a louder plugin took
 * every claim it had. Reading the rank off the claims it currently holds would silently reset such
 * a plugin to the default on its next call.
 */
const ownerPriorities = new Map<string, number>([[HOST_OWNER, HOST_PRIORITY]]);

/**
 * A caller-supplied rank, capped at the ceiling. `undefined` for a value that is not a rank at all:
 * a non-finite one would make every `>=` comparison in blockedBy() false and so refuse nothing, and
 * reading it as an explicit 0 would demote every claim the owner already holds.
 */
function sanitizePriority(priority: number): number | undefined {
  return Number.isFinite(priority) ? Math.min(priority, MAX_PLUGIN_PRIORITY) : undefined;
}

/**
 * Records an owner's rank and moves every claim it already holds onto it in the same step, so the
 * per-claim copies in `owners` can never disagree with the rank itself.
 */
function setOwnerPriority(owner: string, priority: number): void {
  ownerPriorities.set(owner, priority);
  for (const [key, by] of owners) {
    if (by.owner === owner) {
      owners.set(key, { owner, priority });
    }
  }
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
 * One claim, one owner, at the granularity Apollo merges at: a type-level policy (`keyFields`, a
 * type-level `merge`) claims the whole typename, while a `fields` policy claims one field each. A
 * claim held at an equal or higher priority is refused, and only that claim — the rest of the
 * policy, and the rest of the batch, still applies.
 *
 * `owner` identifies the plugin. It is required, must be a non-empty string, and must not be
 * `"host"`; anything else registers nothing and logs an error.
 *
 * `priority` is a property of the OWNER, not of the call: pass it only when a plugin is deliberately
 * meant to outrank another. It is capped at 99, one below the host's own 100, so the host's declared
 * policies cannot be taken over however high a caller aims. An owner's rank is remembered — OMIT
 * `priority` on any later call and the plugin keeps the rank it already has, so a second `init()` or
 * an HMR reload cannot silently demote it. Passing a DIFFERENT value is a deliberate re-declaration:
 * it is warned about, and every claim that owner holds moves to the new rank together.
 *
 * WHAT THIS DOES NOT PROTECT: only the policies the host DECLARES are reserved. The host stores far
 * more typenames than it writes policies for — anything Apollo normalizes by its default `id` rule
 * holds no policy and is therefore unclaimed, so a plugin registering `keyFields` for one of those
 * is accepted. The check is a collision guard between declared policies, not a fence around the
 * host's whole cache surface.
 *
 * The guarantee covers policies registered THROUGH THIS FUNCTION. `apolloClient` is exported from
 * the same facade and holds this very cache, so `apolloClient.cache.policies.addTypePolicies(...)`
 * writes past the ownership map entirely. That route is unowned and unaudited by design; use this
 * one.
 *
 * In development the ownership map and every refusal are readable as `window.modulesCacheDebug`.
 */
export function registerCacheTypePolicies(policies: TypePolicies, options: { owner: string; priority?: number }): void {
  const { owner, priority } = options ?? {};

  // A plugin is plain JS at this boundary, so the type alone guarantees nothing. Both values below
  // would slip through the same-owner exemption in blockedBy(): an absent `owner` makes two
  // unrelated plugins the same actor, and HOST_OWNER impersonates the host and downgrades its rank
  // on the way past.
  if (typeof owner !== "string" || !owner || owner === HOST_OWNER) {
    Logger.error(
      `registerCacheTypePolicies: "owner" is required and must not be "${HOST_OWNER}". Nothing was registered.`,
    );
    return;
  }

  const heldPriority = ownerPriorities.get(owner);
  const requestedPriority = priority === undefined ? undefined : sanitizePriority(priority);
  // An omitted `priority` INHERITS the rank rather than resetting it to the default. Re-registering
  // is the blessed path (HMR, a second `init()`), and forgetting the argument on one of those calls
  // must not hand the claim to a third plugin sitting between the old rank and 0.
  const effectivePriority = requestedPriority ?? heldPriority ?? 0;

  if (heldPriority !== undefined && effectivePriority !== heldPriority) {
    Logger.warn(
      `registerCacheTypePolicies: "${owner}" re-declared its priority as ${effectivePriority}, replacing ` +
        `${heldPriority}. Every claim it already holds moves to the new rank.`,
    );
  }
  setOwnerPriority(owner, effectivePriority);

  const accepted: TypePolicies = {};

  for (const [typename, policy] of Object.entries(policies)) {
    const acceptedPolicy = policy && claimWhatIsFree(typename, policy, owner, effectivePriority);
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
