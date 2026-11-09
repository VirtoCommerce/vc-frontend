import { createGlobalState } from "@vueuse/core";
import { readonly, shallowRef } from "vue";
import { ROUTES } from "@/router/routes/constants";
import type { RouteLocationNormalized, RouteRecordNameGeneric, Router } from "vue-router";

/** What surrounds a content page: the site's header and footer, the logo only, or nothing. */
export type PageLayoutType = "full" | "minimal" | "blank";

export const PAGE_LAYOUTS: readonly PageLayoutType[] = ["full", "minimal", "blank"];

const SLUG_ROUTE_NAMES = new Set<string>([ROUTES.MATCHER.NAME, ROUTES.LOYALTY_CATALOG_MATCHER.NAME]);

const PAGES_OBJECT_TYPE = "Pages";
const CONTENT_FILE_OBJECT_TYPE = "ContentFile";
const PAGE_BUILDER_SOURCE = "page-builder";

export interface ISlugPage {
  objectType?: string;
  document?: { source?: string } | null;
  isMarkdown: boolean;
}

export function isPageLayout(value: unknown): value is PageLayoutType {
  return PAGE_LAYOUTS.includes(value as PageLayoutType);
}

export function joinSlugPath(pathMatch: string | string[] | undefined): string {
  if (!pathMatch) {
    return "/";
  }

  // Because URL `/printers/` is an array of paths ["printers", ""], empty paths must be removed.
  return (Array.isArray(pathMatch) ? pathMatch : [pathMatch]).filter(Boolean).join("/");
}

export function getSlugRoutePermalink(route: {
  name?: RouteRecordNameGeneric | null;
  params: RouteLocationNormalized["params"];
}): string | undefined {
  return SLUG_ROUTE_NAMES.has(String(route.name)) ? joinSlugPath(route.params.pathMatch) || "/" : undefined;
}

/** A document still missing counts as own layout: if none comes, the matcher shows another page in the full layout. */
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

/** `undefined` until the first page reports, so a landing on the minimal layout never shows the full header first. */
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
