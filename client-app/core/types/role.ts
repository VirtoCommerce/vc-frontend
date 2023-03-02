import { StorefrontPermissions, XApiPermissions } from "@/core/constants";
import { ModifyType } from "@/core/types/modify";
import { RoleType } from "@/xapi/types";

export type Role = ModifyType<
  RoleType,
  { normalizedName?: string; permissions: (StorefrontPermissions | XApiPermissions)[] }
>;
