import type { COLORS } from "../../../constants";

declare global {
  type VcSwitchColorType =
    | typeof COLORS.primary
    | typeof COLORS.secondary
    | typeof COLORS.neutral
    | typeof COLORS.accent
    | typeof COLORS.info
    | typeof COLORS.success
    | typeof COLORS.warning
    | typeof COLORS.danger;
}
