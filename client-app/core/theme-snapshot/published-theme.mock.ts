import { useThemeSnapshot } from "./useThemeSnapshot";
import type { IPublishedTheme, IThemeSnapshot } from "./types";

export function publishTheme(
  snapshot: Partial<IThemeSnapshot> = {},
  overrides: Partial<Omit<IPublishedTheme, "snapshot">> = {},
): void {
  useThemeSnapshot().setPublished({
    storeId: "store",
    cultureName: "en-US",
    publication: 1,
    menus: [],
    ...overrides,
    snapshot: { format: 1, publication: 1, cultureName: "en-US", templates: {}, ...snapshot },
  });
}
