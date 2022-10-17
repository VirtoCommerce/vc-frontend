import { Role } from "@/core/types";
import { StorefrontPermissions, XApiPermissions } from "@/core/constants";

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
    XApiPermissions.CanEditOrganization,
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

export const STORE_ADMINISTRATOR: Role = {
  id: "store-admin",
  name: "Store administrator",
  permissions: [
    StorefrontPermissions.CanSeeOrganizationDetail,
    StorefrontPermissions.CanEditOrganization,
    StorefrontPermissions.CanViewUsers,
    StorefrontPermissions.CanCreateUsers,
    StorefrontPermissions.CanEditUsers,
    StorefrontPermissions.CanDeleteUsers,
    StorefrontPermissions.CanInviteUsers,
    StorefrontPermissions.CanViewOrders,
    StorefrontPermissions.CanChangeOrderStatus,
  ],
};

export const STORE_MANAGER: Role = {
  id: "store-manager",
  name: "Store manager",
  permissions: [
    StorefrontPermissions.CanSeeOrganizationDetail,
    StorefrontPermissions.CanViewOrders,
    StorefrontPermissions.CanChangeOrderStatus,
  ],
};

export const B2B_ROLES: Role[] = [ORGANIZATION_EMPLOYEE, PURCHASING_AGENT, ORGANIZATION_MAINTAINER];

export const ALL_ROLES: Role[] = [
  ORGANIZATION_MAINTAINER,
  ORGANIZATION_EMPLOYEE,
  PURCHASING_AGENT,
  STORE_ADMINISTRATOR,
  STORE_MANAGER,
];
