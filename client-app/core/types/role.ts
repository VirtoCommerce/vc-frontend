import { StorefrontPermissions, XApiPermissions } from "@/core/constants";
import { RoleType } from "@/xapi/types";
import { Modify } from "@/core/types/modify";

export type Role = Modify<
  RoleType,
  { normalizedName?: string; permissions: (StorefrontPermissions | XApiPermissions)[] }
>;
