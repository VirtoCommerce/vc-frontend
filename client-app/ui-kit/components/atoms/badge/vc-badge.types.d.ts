import type { COLORS } from "@/core/constants";

declare global {
  type VcBadgeColorType =
    | COLORS.primary
    | COLORS.secondary
    | COLORS.neutral
    | COLORS.info
    | COLORS.success
    | COLORS.warning
    | COLORS.danger;
  type VcBadgeVariantType = "solid" | "solid-light" | "outline" | "outline-dark";
}
