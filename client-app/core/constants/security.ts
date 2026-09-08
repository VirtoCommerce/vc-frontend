import type { ExtendedRoleType } from "@/core/types/role";

export const ORGANIZATION_MAINTAINER: ExtendedRoleType = {
  id: "org-maintainer",
  name: "Organization maintainer",
};

export const ORGANIZATION_EMPLOYEE: ExtendedRoleType = {
  id: "org-employee",
  name: "Organization employee",
};

export const PURCHASING_AGENT: ExtendedRoleType = {
  id: "purchasing-agent",
  name: "Purchasing agent",
};

export const STORE_ADMINISTRATOR: ExtendedRoleType = {
  id: "store-admin",
  name: "Store administrator",
};

export const STORE_MANAGER: ExtendedRoleType = {
  id: "store-manager",
  name: "Store manager",
};

export const ALL_ROLES: ExtendedRoleType[] = [
  ORGANIZATION_MAINTAINER,
  ORGANIZATION_EMPLOYEE,
  PURCHASING_AGENT,
  STORE_ADMINISTRATOR,
  STORE_MANAGER,
];
