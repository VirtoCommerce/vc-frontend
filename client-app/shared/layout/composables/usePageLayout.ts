import { createGlobalState } from "@vueuse/core";
import { readonly, shallowRef } from "vue";
import { ROUTES } from "@/router/routes/constants";
import type { Router } from "vue-router";

/** What surrounds a content page: the site's header and footer, the logo only, or nothing. */
export type PageLayoutType = "full" | "minimal" | "blank";

export const PAGE_LAYOUTS: readonly PageLayoutType[] = ["full", "minimal", "blank"];

/** The routes that resolve a slug: their page reports its layout once it knows what it shows. */
const SLUG_ROUTE_NAMES = new Set<string>([ROUTES.MATCHER.NAME, ROUTES.LOYALTY_CATALOG_MATCHER.NAME]);

const PAGES_OBJECT_TYPE = "Pages";
const CONTENT_FILE_OBJECT_TYPE = "ContentFile";
const PAGE_BUILDER_SOURCE = "page-builder";

export interface ISlugPage {
  objectType?: string;
  /** A page from the database's document, once it is there. */
  document?: { source?: string } | null;
  isMarkdown: boolean;
}

export function isPageLayout(value: unknown): value is PageLayoutType {
  return PAGE_LAYOUTS.includes(value as PageLayoutType);
}

/**
 * Whether a slug's page reports its own layout once its document is there: a Page Builder page, or a file page that
 * is not markdown. A document that does not come makes the slug content empty, and the matcher shows another page in
 * the full layout.
 */
export function isOwnLayoutSlugPage(page: ISlugPage): boolean {
  switch (page.objectType) {
    case PAGES_OBJECT_TYPE:
      return !page.document || page.document.source === PAGE_BUILDER_SOURCE;
    case CONTENT_FILE_OBJECT_TYPE:
      return !page.isMarkdown;
    default:
      return false;
  }
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
