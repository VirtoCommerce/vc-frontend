import { Role } from "./types/role";
import StorefrontPermissions from "@/core/permissions.enum";

export const ORGANIZATION_MAINTAINER: Role = {
  id: "org-maintainer",
  name: "Organization maintainer",
  permissions: [
    StorefrontPermissions.CanSeeOrganizationDetail,
    StorefrontPermissions.CanEditOrganization,
    StorefrontPermissions.CanViewUsers,
    StorefrontPermissions.CanCreateUsers,
    StorefrontPermissions.CanEditUsers,
    StorefrontPermissions.CanDeleteUsers,
    StorefrontPermissions.CanInviteUsers,
  ],
};

export const ORGANIZATION_EMPLOYEE: Role = {
  id: "org-employee",
  name: "Organization employee",
  permissions: [StorefrontPermissions.CanSeeOrganizationDetail, StorefrontPermissions.CanViewUsers],
};

export const PURCHASING_AGENT: Role = {
  id: "purchasing-agent",
  name: "Purchasing agent",
  permissions: [StorefrontPermissions.CanSeeOrganizationDetail, StorefrontPermissions.CanViewUsers],
};

export const ROLES: Role[] = [ORGANIZATION_MAINTAINER, ORGANIZATION_EMPLOYEE, PURCHASING_AGENT];
