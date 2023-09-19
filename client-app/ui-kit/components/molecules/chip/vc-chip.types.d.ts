import type { COLORS } from "@/core/constants";

declare global {
  type VcChipColorType =
    | COLORS.primary
    | COLORS.secondary
    | COLORS.neutral
    | COLORS.info
    | COLORS.success
    | COLORS.warning
    | COLORS.danger;
  type VcChipVariantType = "solid" | "solid-light" | "outline" | "outline-dark";
}
