import { createGlobalState } from "@vueuse/core";
import { readonly, shallowRef } from "vue";
import type { Router } from "vue-router";

/** What surrounds a content page: the site's header and footer, the logo only, or nothing. */
export type PageLayoutType = "full" | "minimal" | "blank";

export const PAGE_LAYOUTS: readonly PageLayoutType[] = ["full", "minimal", "blank"];

/** The routes that resolve a slug: their page reports its layout once it knows what it shows. */
const SLUG_ROUTE_NAMES = new Set(["Matcher", "LoyaltyCatalogMatcher"]);

export function isPageLayout(value: unknown): value is PageLayoutType {
  return PAGE_LAYOUTS.includes(value as PageLayoutType);
}

/**
 * The layout of the page on screen, which the main layout draws its header and footer by. Product, category, cart,
 * checkout and account pages keep `full`; a content page sets its own once its document is there. Until a page of a
 * slug route reports, the layout of the previous page stays, and on the first page there is none yet: the header and
 * footer wait, so a landing on the minimal layout never shows the full header first.
 */
export const usePageLayout = createGlobalState(() => {
  const pageLayout = shallowRef<PageLayoutType>();

  function setPageLayout(value: PageLayoutType): void {
    pageLayout.value = value;
  }

  function installPageLayoutRouting(router: Router): void {
    router.afterEach((to, _from, failure) => {
      if (!failure && !SLUG_ROUTE_NAMES.has(String(to.name))) {
        pageLayout.value = "full";
      }
    });
  }

  return { pageLayout: readonly(pageLayout), setPageLayout, installPageLayoutRouting };
});
