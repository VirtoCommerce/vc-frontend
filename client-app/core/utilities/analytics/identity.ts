/**
 * Mirrors the SalesRep plugin's `SALES_REP_ACCESS_PERMISSION`, duplicated so tagging depends on no feature module.
 * Read as raw membership: `checkPermissions` grants an administrator everything.
 */
const SALES_REP_PERMISSION = "sales-rep:access";

/** Who drives the session: the account owner, someone impersonating them, or nobody signed in. */
export type SessionKindType = "self" | "impersonated" | "anonymous";

export type CustomerIdentityType = {
  /** The platform user id: what every tracker identifies by, and what the backend sends its events under. */
  userId: string;
  contactId?: string;
  organizationId?: string;
  isSalesRep: boolean;
  sessionKind: Exclude<SessionKindType, "anonymous">;
};

type ReadableRefType<T> = { readonly value: T };

/** The slice of `useUser()` the identity is read from; `user` throws before the user loads, hence `isAuthenticated` first. */
export type CustomerIdentitySourceType = {
  isAuthenticated: ReadableRefType<boolean>;
  user: ReadableRefType<{ id: string; contact?: { id: string } | null; permissions?: string[] | null }>;
  organization: ReadableRefType<{ id: string } | null | undefined>;
  operator: ReadableRefType<unknown>;
};

/** `undefined` for a signed-out visitor. */
export function getCustomerIdentity(source: CustomerIdentitySourceType): CustomerIdentityType | undefined {
  if (!source.isAuthenticated.value) {
    return undefined;
  }

  const user = source.user.value;

  return {
    userId: user.id,
    contactId: user.contact?.id || undefined,
    organizationId: source.organization.value?.id || undefined,
    isSalesRep: user.permissions?.includes(SALES_REP_PERMISSION) ?? false,
    sessionKind: source.operator.value ? "impersonated" : "self",
  };
}
