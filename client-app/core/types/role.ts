import type { ModifyType } from "./modify";
import type { PlatformPermissions, XApiPermissions } from "../enums";
import type { RoleType } from "@/core/api/graphql/types";

export type ExtendedRoleType = ModifyType<
  RoleType,
  { normalizedName?: string; permissions: (PlatformPermissions | XApiPermissions)[] }
>;
