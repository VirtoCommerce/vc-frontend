import type { ColorType } from "@/core/enums";

declare global {
  type VcBadgeColorType = Omit<ColorType, "additional">;
  type VcBadgeVariantType = "solid" | "solid-light" | "outline" | "outline-dark";
}
