import type { COLORS } from "@/core/constants";

declare global {
  type VcBadgeColorType =
    | typeof COLORS.primary
    | typeof COLORS.secondary
    | typeof COLORS.neutral
    | typeof COLORS.info
    | typeof COLORS.success
    | typeof COLORS.warning
    | typeof COLORS.danger;
  type VcBadgeVariantType = "solid" | "solid-light" | "outline" | "outline-dark";
}
