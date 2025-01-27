import type { COLORS } from "../../../constants";

declare global {
  type VcChipColorType =
    | typeof COLORS.primary
    | typeof COLORS.secondary
    | typeof COLORS.neutral
    | typeof COLORS.info
    | typeof COLORS.success
    | typeof COLORS.warning
    | typeof COLORS.danger;
  type VcChipVariantType = "solid" | "solid-light" | "outline" | "outline-dark";
}
