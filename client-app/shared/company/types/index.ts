import type { ContactType, RoleType } from "@/core/api/graphql/types";

export enum ContactStatus {
  New = "New",
  Approved = "Approved",
  /**
   * @deprecated
   */
  Rejected = "Rejected",
  Locked = "Locked",
  Deleted = "Deleted",
  Invited = "Invited",
}

export type ContactDisplayStatusType = {
  localeLabel: string;
  iconUrl?: string;
  cssStyles?: string;
};

export type ExtendedContactType = ContactType & {
  extended: {
    emails: string[];
    roles: RoleType[];
    displayStatus: ContactDisplayStatusType;
  };
};
