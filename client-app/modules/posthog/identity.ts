import { getCustomerIdentity } from "@/core/utilities/analytics/identity";
import { useUser } from "@/shared/account";
import { getClient } from "./client";
import { IDENTIFIED_STORAGE_KEY, ORGANIZATION_GROUP_TYPE } from "./constants";
import type { CustomerIdentityType } from "@/core/utilities/analytics/identity";

/** Person properties; the same names the Google Analytics module registers as user-scoped dimensions. */
export const PERSON_PROPERTY_NAMES = {
  contactId: "contact_id",
  organizationId: "organization_id",
  isSalesRep: "is_sales_rep",
  sessionKind: "session_kind",
} as const;

/**
 * Also sent on every event: a person property holds only the latest session, so an impersonated session could not
 * be told from the customer's own ones once they sign in next.
 */
export function buildSessionProperties(identity: CustomerIdentityType): Record<string, string | boolean> {
  return {
    [PERSON_PROPERTY_NAMES.sessionKind]: identity.sessionKind,
    [PERSON_PROPERTY_NAMES.isSalesRep]: identity.isSalesRep,
  };
}

export function buildPersonProperties(identity: CustomerIdentityType): Record<string, string | boolean> {
  return {
    [PERSON_PROPERTY_NAMES.contactId]: identity.contactId ?? "",
    [PERSON_PROPERTY_NAMES.organizationId]: identity.organizationId ?? "",
    [PERSON_PROPERTY_NAMES.isSalesRep]: identity.isSalesRep,
    [PERSON_PROPERTY_NAMES.sessionKind]: identity.sessionKind,
  };
}

/** A watch source: the same string while the identity is unchanged. */
export function identityKey(): string {
  return JSON.stringify(getCustomerIdentity(useUser()) ?? null);
}

export function applyIdentity(): void {
  const client = getClient();

  if (!client) {
    return;
  }

  const identity = getCustomerIdentity(useUser());

  if (identity) {
    client.identify(identity.userId, buildPersonProperties(identity));
    client.register(buildSessionProperties(identity));

    if (identity.organizationId) {
      client.group(ORGANIZATION_GROUP_TYPE, identity.organizationId);
    } else {
      // `group` persists as a super property; a user without an organization must not inherit the previous one's.
      client.resetGroups();
    }

    rememberIdentified(true);
    return;
  }

  // A sign-out reloads every tab before `user` clears, so this runs on the next boot, where the SDK's persistence
  // still holds the previous person; without the reset the next visitor's events would land on them. Own flag, not
  // the SDK's internal state: an anonymous visitor must not be reset on every boot either.
  if (wasIdentified()) {
    client.reset();
    rememberIdentified(false);
  }
}

function wasIdentified(): boolean {
  try {
    return localStorage.getItem(IDENTIFIED_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberIdentified(value: boolean): void {
  try {
    if (value) {
      localStorage.setItem(IDENTIFIED_STORAGE_KEY, "1");
    } else {
      localStorage.removeItem(IDENTIFIED_STORAGE_KEY);
    }
  } catch {
    // No storage: the next signed-out boot cannot know, and keeps the person — the same as before this flag existed.
  }
}
