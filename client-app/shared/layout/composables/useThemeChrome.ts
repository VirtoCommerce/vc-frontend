import { computed } from "vue";
import { useWhiteLabeling } from "@/core/composables/useWhiteLabeling";
import { useThemeSnapshot } from "@/core/theme-snapshot";
import { useThemeGroups } from "@/core/theme-snapshot/groups";
import { isSafeLinkUrl } from "@/core/utilities/common";
import type { ExtendedMenuLinkType } from "@/core/types";
import type { StyleValue } from "vue";

interface IFooterMenuBlock {
  id?: string;
  heading?: string;
  menu?: string;
  links?: { label?: string; link?: string }[];
}

/** Each part is `undefined` while the theme leaves it to the storefront's own header and footer. */
export function useThemeChrome() {
  const { siteHeader, getGroupSection, getMenuLinks: getStoreMenuLinks } = useThemeGroups();
  const { theme } = useThemeSnapshot();
  const { footerLinks: whiteLabelingFooterLinks } = useWhiteLabeling();

  function getMenuLinks(name: unknown): ExtendedMenuLinkType[] | undefined {
    return withSafeRoutes(getStoreMenuLinks(name));
  }

  const siteFooter = computed(() => getGroupSection("footer", "site-footer"));
  const announcementBar = computed(() => getGroupSection("header", "announcement-bar"));

  /** In pixels; without it the logo keeps the header's height. */
  const logoWidth = computed(() => {
    const value = Number(siteHeader.value?.logo_width);
    return Number.isFinite(value) && value > 0 ? value : undefined;
  });

  const logoStyle = computed<StyleValue | undefined>(() =>
    logoWidth.value ? { "--header-logo-width": `${logoWidth.value}px` } : undefined,
  );

  const iconsMenuLinks = computed(() => getMenuLinks(siteHeader.value?.icons_menu));

  const footerColumns = computed<ExtendedMenuLinkType[] | undefined>(() => {
    if (whiteLabelingFooterLinks.value?.length) {
      return undefined;
    }

    const blocks = (siteFooter.value?.blocks ?? []).filter(
      (block) => block.type === "footer-menu" && !block.hidden,
    ) as IFooterMenuBlock[];

    if (!blocks.length) {
      return undefined;
    }

    const columns = blocks.map((block) => ({
      id: block.id,
      title: block.heading ?? "",
      children:
        getMenuLinks(block.menu) ??
        (block.links ?? []).map((link) => ({
          title: link.label ?? "",
          route: link.link && isSafeLinkUrl(link.link) ? link.link : undefined,
        })),
    }));

    // The designer still shows a column without links, so the editor can fill it in.
    return theme.value?.isDraft ? columns : columns.filter((column) => column.children.length);
  });

  const copyright = computed(() =>
    typeof siteFooter.value?.copyright === "string" && siteFooter.value.copyright
      ? siteFooter.value.copyright
      : undefined,
  );

  const isCreditShown = computed(() => siteFooter.value?.show_credit !== false);

  return {
    siteHeader,
    siteFooter,
    announcementBar,
    logoWidth,
    logoStyle,
    iconsMenuLinks,
    footerColumns,
    copyright,
    isCreditShown,
  };
}

/** A store menu is content too: an unsafe link opens nothing, like a link the editor typed in. */
function withSafeRoutes(links: ExtendedMenuLinkType[] | undefined): ExtendedMenuLinkType[] | undefined {
  return links?.map((link) => ({
    ...link,
    route: typeof link.route === "string" && !isSafeLinkUrl(link.route) ? undefined : link.route,
    children: withSafeRoutes(link.children),
  }));
}
