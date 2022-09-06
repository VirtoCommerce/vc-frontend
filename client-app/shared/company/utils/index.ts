import { XapiContactStatus } from "@/core/constants";
import { OrganizationContactDisplayStatusType, OrganizationContactType } from "@/core/types";
import {
  ContactType,
  DynamicPropertyValueType,
  InputDynamicPropertyValueType,
  InputMemberAddressType,
  InputUpdateContactType,
  MemberAddressType,
  UserType,
} from "@/xapi/types";
import _ from "lodash";

export function getEmailAddress(contact: ContactType): string | undefined {
  let email: string | undefined;
  if (contact.emails && contact.emails.length) {
    email = contact.emails[0];
  }
  if (!email && contact.securityAccounts && contact.securityAccounts.length) {
    email = contact.securityAccounts[0].email;
  }
  return email;
}

export function getFullName(contact: ContactType): string {
  return contact.fullName || contact.name || `${contact.firstName} ${contact.lastName}`;
}

export function getRoleName(contact: ContactType): string | undefined {
  let roleName: string | undefined;
  if (contact.securityAccounts && contact.securityAccounts.length) {
    const securityAccount: UserType = contact.securityAccounts[0];
    if (securityAccount.roles && securityAccount.roles.length) {
      roleName = securityAccount.roles[0].name;
    }
  }
  return roleName;
}

export function getDisplayContactStatus(xapiStatus?: string): OrganizationContactDisplayStatusType {
  switch (xapiStatus) {
    case XapiContactStatus.Approved:
      return {
        localeLabel: "pages.company.members.statuses.active",
        iconUrl: "/static/icons/contact-active.svg",
        cssStyles: "bg-success-500 text-white",
      };
    case XapiContactStatus.Rejected:
      return {
        localeLabel: "pages.company.members.statuses.blocked",
        iconUrl: "/static/icons/contact-blocked.svg",
        cssStyles: "bg-error-600 text-white",
      };
    default:
      return {
        localeLabel: "pages.company.members.statuses.inactive",
        iconUrl: "/static/icons/contact-inactive.svg",
        cssStyles: "text-gray-500 border border-solid border-gray-500",
      };
  }
}

export function convertToOrganizationContact(
  contact: ContactType,
  contactFullNameFallback: string
): OrganizationContactType {
  const contactFullName: string = getFullName(contact);
  return {
    ...contact,
    fullName: contact.status ? contactFullName : contactFullNameFallback,
    email: getEmailAddress(contact),
    role: getRoleName(contact),
    displayStatus: getDisplayContactStatus(contact.status),
  };
}

export function convertToInputUpdateContact(contact: OrganizationContactType): InputUpdateContactType {
  return {
    ...contact,
    addresses: _.map(contact.addresses?.items, (address: MemberAddressType) => address as InputMemberAddressType),
    dynamicProperties: _.map(
      contact.dynamicProperties,
      (dp: DynamicPropertyValueType) => dp as InputDynamicPropertyValueType
    ),
    organizations: contact.organizationsIds,
  };
}
