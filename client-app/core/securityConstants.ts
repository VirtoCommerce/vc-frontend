import { Role } from "./types/role";

export const ORGANIZATION_MAINTAINER: Role = {
  id: "org-maintainer",
  name: "Organization maintainer",
};

export const ORGANIZATION_EMPLOYEE: Role = {
  id: "org-employee",
  name: "Organization employee",
};

export const PURCHASING_AGENT: Role = {
  id: "purchasing-agent",
  name: "Purchasing agent",
};

export const ROLES: Role[] = [ORGANIZATION_MAINTAINER, ORGANIZATION_EMPLOYEE, PURCHASING_AGENT];
