import { useUser } from "@/shared/account";

/**
 * GA4 user-scoped custom dimensions.
 *
 * Every name here has to be registered by hand in GA4 Admin against the exact same string, and GA does not
 * backfill: renaming one strands every report already built on it and starts its replacement from empty.
 * They live in one map so a store whose own property names collide can rename in a single place — see the
 * registration table in README.md.
 */
export const USER_PROPERTY_NAMES = {
  contactId: "contact_id",
  organizationId: "organization_id",
  organizationName: "organization_name",
  isSalesRep: "is_sales_rep",
  sessionKind: "session_kind",
} as const;

/**
 * Mirrors `SALES_REP_ACCESS_PERMISSION` in the sales-rep module. A duplicated literal rather than an
 * import: analytics tagging must not make this module depend on a feature module.
 *
 * Deliberately raw membership, unlike `useUser().checkPermissions`, which grants an administrator every
 * permission — a store admin who never opens the hub is not a sales rep, and reporting them as one would
 * be worse than reporting nothing.
 */
const SALES_REP_PERMISSION = "sales-rep:access";

/** Whether the person driving the session is the account owner or someone impersonating them. */
export type SessionKindType = "self" | "impersonated";

/** Every name in `USER_PROPERTY_NAMES`, `undefined` meaning "clear whatever GA holds for this one". */
export type UserPropertiesType = Record<string, string | undefined>;

// GA4 truncates a user-property value past this length silently. Doing it here instead keeps the stored
// value predictable and testable.
const VALUE_MAX_LENGTH = 36;

/**
 * The customer identity to tag GA events with — every property, every time.
 *
 * gtag `set` MERGES into what it already holds, so a key left out keeps the previous user's value: an
 * omitted `organization_id` would carry the last customer's organization into the next session, and an
 * anonymous visitor would keep browsing under the identity of whoever signed out. `undefined` is how GA is
 * told to drop one, so absent values are sent explicitly rather than skipped.
 *
 * `useUser().user` throws when the user has not loaded, so every read sits behind `isAuthenticated`.
 */
export function buildUserProperties(): UserPropertiesType {
  const { isAuthenticated, user, organization, operator } = useUser();

  if (!isAuthenticated.value) {
    return clearedProperties();
  }

  const sessionKind: SessionKindType = operator.value ? "impersonated" : "self";

  return {
    [USER_PROPERTY_NAMES.contactId]: capped(user.value.contact?.id),
    [USER_PROPERTY_NAMES.organizationId]: capped(organization.value?.id),
    [USER_PROPERTY_NAMES.organizationName]: capped(organization.value?.name),
    // A flag rather than the role list: real role names run 18-20 characters, so a joined list overflows
    // the 36-character cap after one or two and silently drops the rest — including, half the time, the
    // very role this exists to report.
    [USER_PROPERTY_NAMES.isSalesRep]: String(user.value.permissions?.includes(SALES_REP_PERMISSION) ?? false),
    [USER_PROPERTY_NAMES.sessionKind]: sessionKind,
  };
}

/**
 * A watch source for the properties above: the same string while the identity is unchanged. Derived from
 * `buildUserProperties` rather than listing the fields again, so the two cannot drift.
 */
export function userPropertiesKey(): string {
  return JSON.stringify(buildUserProperties());
}

/** Every property present and empty — what an anonymous visitor is tagged with, i.e. nothing. */
function clearedProperties(): UserPropertiesType {
  return Object.fromEntries(Object.values(USER_PROPERTY_NAMES).map((name) => [name, undefined]));
}

function capped(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  return value.slice(0, VALUE_MAX_LENGTH);
}
