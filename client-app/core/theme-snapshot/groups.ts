import { createGlobalState } from "@vueuse/core";
import { computed, shallowReactive } from "vue";
import { getMenu } from "@/core/api/graphql";
import { useLanguages } from "@/core/composables/useLanguages";
import { Logger } from "@/core/utilities";
import { convertToExtendedMenuLink } from "@/core/utilities/menu";
import { THEME_SNAPSHOT_LOG_SCOPE } from "./query";
import { useThemeSnapshot } from "./useThemeSnapshot";
import type { IThemeItem, IThemeMenu, IThemeMenuLink } from "./types";
import type { MenuLinkType } from "@/core/api/graphql/types";
import type { ExtendedMenuLinkType } from "@/core/types";

export type ThemeGroupType = "header" | "footer";

export const useThemeGroups = createGlobalState(() => {
  const { theme, localizeThemeDraft } = useThemeSnapshot();
  const { currentLanguage } = useLanguages();
  /** A draft can name menus the published snapshot does not carry. */
  const draftMenus = shallowReactive(new Map<string, MenuLinkType[]>());
  const requestedDraftMenus = new Set<string>();

  const groups = computed<Record<ThemeGroupType, IThemeItem[]>>(() => {
    const content = { header: theme.value?.header?.content ?? [], footer: theme.value?.footer?.content ?? [] };

    return localizeThemeDraft(content);
  });

  function getGroupSection(group: ThemeGroupType, type: string): IThemeItem | undefined {
    return groups.value[group].find((item) => item.type === type && !item.hidden);
  }

  /** Undefined while the menu is unread, missing or empty, so the part showing it keeps its own content. */
  function getMenuLinks(name: unknown, isCatalogItem = false): ExtendedMenuLinkType[] | undefined {
    if (typeof name !== "string" || !name) {
      return undefined;
    }

    const menu = findPublishedMenu(name);
    const links = menu
      ? menu.items.map((item) => toMenuLink(item, isCatalogItem))
      : draftMenus
          .get(getDraftMenuKey(name, currentLanguage.value?.cultureName))
          ?.map((item) => convertToExtendedMenuLink(item, isCatalogItem));

    return links?.length ? links : undefined;
  }

  /** Reads the menus a draft names that the published snapshot does not carry, each once per language. */
  async function loadDraftMenus(names: string[]): Promise<void> {
    const cultureName = currentLanguage.value?.cultureName;

    await Promise.all(
      names.filter((name) => name && !findPublishedMenu(name)).map((name) => loadDraftMenu(name, cultureName)),
    );
  }

  async function loadDraftMenu(name: string, cultureName: string | undefined): Promise<void> {
    const draftKey = getDraftMenuKey(name, cultureName);

    if (requestedDraftMenus.has(draftKey)) {
      return;
    }

    requestedDraftMenus.add(draftKey);

    try {
      // In the language it was asked in: the response may come after a switch to another one.
      draftMenus.set(draftKey, (await getMenu(name, cultureName)) as MenuLinkType[]);
    } catch (error) {
      requestedDraftMenus.delete(draftKey);
      Logger.error(`${THEME_SNAPSHOT_LOG_SCOPE} Failed to load the draft menu`, error);
    }
  }

  function findPublishedMenu(name: string): IThemeMenu | undefined {
    const key = name.toLowerCase();
    return theme.value?.menus.find((item) => item.name.toLowerCase() === key);
  }

  const siteHeader = computed(() => getGroupSection("header", "site-header"));

  return { groups, siteHeader, getGroupSection, getMenuLinks, loadDraftMenus };
});

function getDraftMenuKey(name: string, cultureName: string | undefined): string {
  return `${cultureName ?? ""}:${name.toLowerCase()}`;
}

function toMenuLink(item: IThemeMenuLink, isCatalogItem: boolean): ExtendedMenuLinkType {
  return convertToExtendedMenuLink(
    { ...item, url: item.url ?? "", priority: item.priority ?? 0, childItems: item.childItems ?? [] } as MenuLinkType,
    isCatalogItem,
  );
}
