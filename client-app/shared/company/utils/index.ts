import { ContactStatus } from "../types";
import type { ContactType, RoleType } from "@/core/api/graphql/types";
import type { ContactDisplayStatusType, ExtendedContactType } from "@/shared/company";

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
  return contact.securityAccounts?.[0]?.roles ?? [];
}

// TODO: move this logic into a Vue component-atom
export function getDisplayContactStatus(status?: string): ContactDisplayStatusType {
  switch (status) {
    case ContactStatus.Approved:
      return {
        localeLabel: "pages.company.members.statuses.active",
        iconUrl: "/static/icons/contact-active.svg",
        cssStyles: "bg-[color:var(--color-success)] text-white",
      };

    case ContactStatus.Locked:
      return {
        localeLabel: "pages.company.members.statuses.blocked",
        iconUrl: "/static/icons/contact-blocked.svg",
        cssStyles: "bg-[color:var(--color-danger)] text-white",
      };

    default:
      return {
        localeLabel: "pages.company.members.statuses.inactive",
        iconUrl: "/static/icons/contact-inactive.svg",
        cssStyles: "text-gray-500 border border-solid border-gray-500",
      };
  }
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
      displayStatus: getDisplayContactStatus(contact.status),
    },
  };
}
