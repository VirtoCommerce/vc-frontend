import type { ModifyType } from "./modify";
import type { RoleType } from "@/core/api/graphql/types";

export type ExtendedRoleType = ModifyType<RoleType, { normalizedName?: string }>;
