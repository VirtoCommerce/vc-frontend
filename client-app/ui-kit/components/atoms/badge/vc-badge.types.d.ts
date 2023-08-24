import type { ColorType } from "@/core/enums";

declare global {
  type VcBadgeColorType = ColorType;
  type VcBadgeVariantType = "solid" | "solid-light" | "outline" | "outline-dark";
}
