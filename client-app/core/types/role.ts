import { StorefrontPermissions } from "@/core/constants";

export type Role = {
  id: string;
  name: string;
  permissions: StorefrontPermissions[];
};
