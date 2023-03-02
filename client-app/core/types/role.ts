import type { RoleType } from "@/xapi/types";
import type { StorefrontPermissions, XApiPermissions } from "../constants";
import type { ModifyType } from "./modify";

export type ExtendedRoleType = ModifyType<
  RoleType,
  { normalizedName?: string; permissions: (StorefrontPermissions | XApiPermissions)[] }
>;
