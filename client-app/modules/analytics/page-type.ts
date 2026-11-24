import { snakeCase } from "lodash-es";
import { apolloClient } from "@/core/api/graphql/client";
import { GetSlugInfoDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities/logger";
import { CONTENT_FILE_OBJECT_TYPE, PAGES_OBJECT_TYPE } from "@/shared/common/constants/slug-object-types";
import { getSlugRoutePermalink } from "@/shared/layout/composables/usePageLayout";
import { DEBUG_PREFIX } from "./constants";
import type { RouteLocationNormalizedGeneric } from "vue-router";

const HOME_PAGE_TYPE = "home";
const REDIRECT_PAGE_TYPE = "redirect";

/** The page the slug matcher renders for each `slugInfo` object type; a type missing here goes out snake_cased. */
const SLUG_PAGE_TYPES: Record<string, string> = {
  Catalog: "catalog",
  Category: "category",
  CatalogProduct: "product",
  Brands: "brands",
  Brand: "brand",
  NewsArticle: "news_article",
  [PAGES_OBJECT_TYPE]: "virto_page",
  [CONTENT_FILE_OBJECT_TYPE]: "content_page",
};

/**
 * The page type known from the route alone: the route name for a named route, `home` for the root (whatever content
 * the store puts there), `undefined` for any other slug URL — see `resolveSlugPageType`.
 */
export function getRoutePageType(route: RouteLocationNormalizedGeneric): string | undefined {
  if (route.path === "/") {
    return HOME_PAGE_TYPE;
  }
  if (getSlugRoutePermalink(route) !== undefined || !route.name) {
    return undefined;
  }
  return snakeCase(String(route.name));
}

/**
 * The matcher's own document and cache, so the answer is usually the request the page sends anyway (cached, or shared
 * while in flight). `undefined` when the lookup fails or the slug describes no page.
 */
export async function resolveSlugPageType(permalink: string): Promise<string | undefined> {
  try {
    const { data } = await apolloClient.query({
      query: GetSlugInfoDocument,
      variables: {
        permalink,
        storeId: globals.storeId,
        userId: globals.userId,
        cultureName: globals.cultureName,
      },
      fetchPolicy: "cache-first",
    });

    const slugInfo = data?.slugInfo;
    if (!slugInfo) {
      return undefined;
    }

    const objectType = slugInfo.entityInfo?.objectType;
    if (objectType) {
      return SLUG_PAGE_TYPES[objectType] ?? snakeCase(objectType);
    }

    // No entity is not "not found": the matcher also serves page-builder and internal pages no slug describes.
    return slugInfo.redirectUrl ? REDIRECT_PAGE_TYPE : undefined;
  } catch (e) {
    Logger.error(DEBUG_PREFIX, "page type lookup failed", e);
    return undefined;
  }
}
