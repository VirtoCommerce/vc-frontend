import { createGlobalState } from "@vueuse/core";
import { computed, shallowReactive } from "vue";
import { getMenu } from "@/core/api/graphql";
import { useLanguages } from "@/core/composables/useLanguages";
import { Logger } from "@/core/utilities";
import { convertToExtendedMenuLink } from "@/core/utilities/menu";
import { resolveTranslatableValues } from "./translatable";
import { useThemeSnapshot } from "./useThemeSnapshot";
import type { IThemeItem, IThemeMenuLink } from "./types";
import type { MenuLinkType } from "@/core/api/graphql/types";
import type { ExtendedMenuLinkType } from "@/core/types";

export type ThemeGroupType = "header" | "footer";

export const useThemeGroups = createGlobalState(() => {
  const { theme } = useThemeSnapshot();
  const { currentLanguage, defaultStoreCulture } = useLanguages();
  /** A draft can name menus the published snapshot does not carry. */
  const draftMenus = shallowReactive(new Map<string, ExtendedMenuLinkType[]>());
  const requestedDraftMenus = new Set<string>();

  const groups = computed<Record<ThemeGroupType, IThemeItem[]>>(() => {
    const content = { header: theme.value?.header?.content ?? [], footer: theme.value?.footer?.content ?? [] };

    // Only the designer's draft can hold translatable dictionaries; a published snapshot has one language.
    return theme.value?.isDraft
      ? resolveTranslatableValues(content, currentLanguage.value?.cultureName ?? "", defaultStoreCulture.value)
      : content;
  });

  function getGroupSection(group: ThemeGroupType, type: string): IThemeItem | undefined {
    return groups.value[group].find((item) => item.type === type && !item.hidden);
  }

  function getMenuLinks(name: unknown, isCatalogItem = false): ExtendedMenuLinkType[] | undefined {
    if (typeof name !== "string" || !name) {
      return undefined;
    }

    const key = name.toLowerCase();
    const menu = theme.value?.menus.find((item) => item.name.toLowerCase() === key);

    if (menu) {
      return menu.items.map((item) => toMenuLink(item, isCatalogItem));
    }

    // Undefined until it is read, so the part showing it keeps its own content meanwhile.
    const draftKey = `${currentLanguage.value?.cultureName ?? ""}:${key}`;

    if (theme.value?.isDraft && !requestedDraftMenus.has(draftKey)) {
      requestedDraftMenus.add(draftKey);
      void loadDraftMenu(name, draftKey);
    }

    return draftMenus.get(draftKey);
  }

  async function loadDraftMenu(name: string, draftKey: string): Promise<void> {
    try {
      draftMenus.set(
        draftKey,
        (await getMenu(name)).map((item) => convertToExtendedMenuLink(item as MenuLinkType, false)),
      );
    } catch (error) {
      requestedDraftMenus.delete(draftKey);
      Logger.error(`${useThemeGroups.name}.${loadDraftMenu.name}`, error);
    }
  }

  const siteHeader = computed(() => getGroupSection("header", "site-header"));

  return { groups, siteHeader, getGroupSection, getMenuLinks };
});

function toMenuLink(item: IThemeMenuLink, isCatalogItem: boolean): ExtendedMenuLinkType {
  return convertToExtendedMenuLink(
    { ...item, url: item.url ?? "", priority: item.priority ?? 0, childItems: item.childItems ?? [] } as MenuLinkType,
    isCatalogItem,
  );
}
