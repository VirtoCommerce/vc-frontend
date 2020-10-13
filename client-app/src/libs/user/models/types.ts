export class AddUser {
  firstName = "";
  lastName = "";
  email?: string = "";
  userName = "";
  password = "";
  confirmPassword = "";
  role = "";
}

export type OrganizationContactsSearchQuery = {
  orgId: string;
  pageNumber?: number;
  pageSize?: number;
  keyword?: string;
};
