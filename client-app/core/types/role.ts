import StorefrontPermissions from "@/core/permissions.enum";

export type Role = {
  id: string;
  name: string;
  permissions: StorefrontPermissions[];
};
