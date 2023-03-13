import type { ModifyType } from "./modify";
import type { StorefrontPermissions, XApiPermissions } from "../enums";
import type { RoleType } from "@/xapi/types";

export type ExtendedRoleType = ModifyType<
  RoleType,
  { normalizedName?: string; permissions: (StorefrontPermissions | XApiPermissions)[] }
>;
