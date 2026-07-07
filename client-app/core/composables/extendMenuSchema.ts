import { useNavigations } from "@/core/composables/useNavigations";
import type { MenuType } from "@/core/types";
import type { DeepPartial } from "utility-types";

/**
 * Narrow facade helper for Module Federation plugins: contribute additional menu items
 * (e.g. an account-nav link) without exposing the whole useNavigations surface.
 * Same live singleton — the host provides this module at runtime via the MF shared scope.
 */
export function extendMenuSchema(schema: DeepPartial<MenuType>): void {
  useNavigations().mergeMenuSchema(schema);
}
