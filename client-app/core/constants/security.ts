import { StorefrontPermissions, XApiPermissions } from "@/core/enums/permissions.enum";
import type { ExtendedRoleType } from "@/core/types/role";

export const ORGANIZATION_MAINTAINER: ExtendedRoleType = {
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

export const ORGANIZATION_EMPLOYEE: ExtendedRoleType = {
  id: "org-employee",
  name: "Organization employee",
  permissions: [StorefrontPermissions.CanSeeOrganizationDetail, StorefrontPermissions.CanViewUsers],
};

export const PURCHASING_AGENT: ExtendedRoleType = {
  id: "purchasing-agent",
  name: "Purchasing agent",
  permissions: [StorefrontPermissions.CanSeeOrganizationDetail, StorefrontPermissions.CanViewUsers],
};

export const STORE_ADMINISTRATOR: ExtendedRoleType = {
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

export const STORE_MANAGER: ExtendedRoleType = {
  id: "store-manager",
  name: "Store manager",
  permissions: [
    StorefrontPermissions.CanSeeOrganizationDetail,
    StorefrontPermissions.CanViewOrders,
    StorefrontPermissions.CanChangeOrderStatus,
  ],
};

export const B2B_ROLES: ExtendedRoleType[] = [ORGANIZATION_EMPLOYEE, PURCHASING_AGENT, ORGANIZATION_MAINTAINER];

export const ALL_ROLES: ExtendedRoleType[] = [
  ORGANIZATION_MAINTAINER,
  ORGANIZATION_EMPLOYEE,
  PURCHASING_AGENT,
  STORE_ADMINISTRATOR,
  STORE_MANAGER,
];
