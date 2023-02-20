import { StorefrontPermissions, XApiPermissions } from "@/core/constants";
import { Modify } from "@/core/types/modify";
import { RoleType } from "@/xapi/types";

export type Role = Modify<
  RoleType,
  { normalizedName?: string; permissions: (StorefrontPermissions | XApiPermissions)[] }
>;
