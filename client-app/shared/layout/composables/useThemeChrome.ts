import { computed } from "vue";
import { useWhiteLabeling } from "@/core/composables/useWhiteLabeling";
import { useThemeGroups } from "@/core/theme-snapshot/groups";
import type { ExtendedMenuLinkType } from "@/core/types";

/** A footer column of the theme: a heading over a store link list, or over the links the block lists itself. */
interface IFooterMenuBlock {
  id?: string;
  heading?: string;
  menu?: string;
  links?: { label?: string; link?: string }[];
}

/**
 * What the Page Builder theme's header and footer groups set on the storefront's own header and footer. Each part is
 * `undefined` while the theme leaves it as it always was.
 */
export function useThemeChrome() {
  const { siteHeader, getGroupSection, getMenuLinks } = useThemeGroups();
  const { footerLinks: whiteLabelingFooterLinks } = useWhiteLabeling();

  const siteFooter = computed(() => getGroupSection("footer", "site-footer"));
  const announcementBar = computed(() => getGroupSection("header", "announcement-bar"));

  /** The logo's width in pixels; without it the logo keeps the header's height. */
  const logoWidth = computed(() => {
    const value = Number(siteHeader.value?.logo_width);
    return Number.isFinite(value) && value > 0 ? value : undefined;
  });

  /** The links of the header's icons menu, which the icons of the built-in links keep. */
  const iconsMenuLinks = computed(() => getMenuLinks(siteHeader.value?.icons_menu));

  const footerColumns = computed<ExtendedMenuLinkType[] | undefined>(() => {
    // White-labeling's footer links replace the theme's footer menus.
    if (whiteLabelingFooterLinks.value?.length) {
      return undefined;
    }

    const blocks = (siteFooter.value?.blocks ?? []).filter(
      (block) => block.type === "footer-menu" && !block.hidden,
    ) as IFooterMenuBlock[];

    return blocks.length
      ? blocks.map((block) => ({
          id: block.id,
          title: block.heading ?? "",
          children:
            getMenuLinks(block.menu) ??
            (block.links ?? []).map((link) => ({ title: link.label ?? "", route: link.link ?? "" })),
        }))
      : undefined;
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
    iconsMenuLinks,
    footerColumns,
    copyright,
    isCreditShown,
  };
}
