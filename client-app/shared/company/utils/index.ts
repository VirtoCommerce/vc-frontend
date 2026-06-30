import uniqBy from "lodash/uniqBy";
import { ContactStatus } from "../types";
import type { ContactType, RoleType } from "@/core/api/graphql/types";
import type { ExtendedContactType } from "@/shared/company";

export function getContactEmailAddresses(contact: ContactType): string[] {
  let emails: string[] = [];

  if (contact.emails?.length) {
    emails = contact.emails;
  } else if (contact.securityAccounts?.[0]?.email) {
    emails = [contact.securityAccounts[0].email];
  }

  return emails;
}

export function getFullName(contact: ContactType): string {
  return contact.fullName || contact.name || `${contact.firstName} ${contact.lastName}`;
}

export function getContactRoles(contact: ContactType): RoleType[] {
  const orgRoles = contact.rolesInOrganization ?? [];
  const globalRoles = contact.securityAccounts?.flatMap((sa) => sa.roles ?? []) ?? [];

  return uniqBy(
    [...orgRoles, ...globalRoles].filter((r) => r.id),
    "id",
  );
}

export function convertToExtendedContact(contact: ContactType, fullNameFallback: string): ExtendedContactType {
  const contactFullName: string = getFullName(contact);

  return {
    ...contact,
    fullName:
      contact.status && contact.status !== ContactStatus.Invited.toString() ? contactFullName : fullNameFallback,
    extended: {
      roles: getContactRoles(contact),
      emails: getContactEmailAddresses(contact),
    },
  };
}
