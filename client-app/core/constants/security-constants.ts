import { Role } from "@/core/types";
import { StorefrontPermissions } from "@/core/constants";

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
