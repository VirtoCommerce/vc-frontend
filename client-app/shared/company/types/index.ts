import { Role } from "@/core/types";
import { ContactType, RoleType } from "@/xapi/types";

export enum ContactStatus {
  New = "New",
  Approved = "Approved",
  Rejected = "Rejected",
  Deleted = "Deleted",
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

export type AddNewMember = {
  role: Role;
  email: string;
  firstName: string;
  lastName: string;
};
