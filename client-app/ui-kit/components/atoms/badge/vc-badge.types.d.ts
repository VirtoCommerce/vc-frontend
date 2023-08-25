import type { Colors } from "@/core/enums";

declare global {
  type VcBadgeColorType =
    | Colors.primary
    | Colors.secondary
    | Colors.neutral
    | Colors.info
    | Colors.success
    | Colors.warning
    | Colors.danger;
  type VcBadgeVariantType = "solid" | "solid-light" | "outline" | "outline-dark";
}
