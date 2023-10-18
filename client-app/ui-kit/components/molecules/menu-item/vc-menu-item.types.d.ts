import type { COLORS } from "@/core/constants";

declare global {
  type VcMenuItemColorType =
    | typeof COLORS.primary
    | typeof COLORS.secondary
    | typeof COLORS.neutral
    | typeof COLORS.info
    | typeof COLORS.success
    | typeof COLORS.warning
    | typeof COLORS.danger;
}
