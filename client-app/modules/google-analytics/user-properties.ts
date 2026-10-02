import { useUser } from "@/shared/account";

/**
 * GA4 user-scoped custom dimensions. Each must be registered by hand in GA4 Admin under this exact string, and GA
 * does not backfill: a rename strands every report built on it (registration table: README.md).
 */
export const USER_PROPERTY_NAMES = {
  contactId: "contact_id",
  organizationId: "organization_id",
  organizationName: "organization_name",
  isSalesRep: "is_sales_rep",
  sessionKind: "session_kind",
} as const;

/**
 * Mirrors the sales-rep module's `SALES_REP_ACCESS_PERMISSION`, duplicated so tagging depends on no feature module.
 * Read as raw membership: `checkPermissions` grants an administrator everything.
 */
const SALES_REP_PERMISSION = "sales-rep:access";

/** Whether the person driving the session is the account owner or someone impersonating them. */
export type SessionKindType = "self" | "impersonated";

/** Every name in `USER_PROPERTY_NAMES`, `undefined` meaning "clear whatever GA holds for this one". */
export type UserPropertiesType = Record<string, string | undefined>;

// GA4 silently truncates a user-property value past this length; truncating here keeps it predictable.
const VALUE_MAX_LENGTH = 36;

/**
 * Every property, every time: gtag `set` MERGES, so an omitted key keeps the previous user's value; `undefined`
 * is how GA drops one. `useUser().user` throws before the user loads, so every read sits behind `isAuthenticated`.
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
    // A flag, not the role list: a joined list overflows the 36-character cap after one or two role names.
    [USER_PROPERTY_NAMES.isSalesRep]: String(user.value.permissions?.includes(SALES_REP_PERMISSION) ?? false),
    [USER_PROPERTY_NAMES.sessionKind]: sessionKind,
  };
}

/** A watch source: the same string while the identity is unchanged; derived from `buildUserProperties`. */
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
