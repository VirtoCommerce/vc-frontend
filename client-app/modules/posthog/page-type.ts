import { snakeCase } from "lodash-es";
import { apolloClient } from "@/core/api/graphql/client";
import { GetSlugInfoDocument } from "@/core/api/graphql/types";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { DEBUG_PREFIX } from "./constants";
import type { RouteLocationNormalizedGeneric } from "vue-router";

const HOME_PAGE_TYPE = "home";
const NOT_FOUND_PAGE_TYPE = "not_found";
const REDIRECT_PAGE_TYPE = "redirect";

/** The page the slug matcher renders for each `slugInfo` object type; a type missing here goes out snake_cased. */
const SLUG_PAGE_TYPES: Record<string, string> = {
  Catalog: "catalog",
  Category: "category",
  CatalogProduct: "product",
  Brands: "brands",
  Brand: "brand",
  NewsArticle: "news_article",
  Pages: "virto_page",
  ContentFile: "content_page",
};

/**
 * The permalink of a slug URL, built the way `pages/matcher/matcher.vue` and `slug-content.vue` build it (an empty
 * match is a string, read as the root), or `undefined` for a named route. Both catch-all routes of the matcher keep
 * the URL in the `pathMatch` param.
 */
export function getSlugPermalink(route: RouteLocationNormalizedGeneric): string | undefined {
  if (!("pathMatch" in route.params)) {
    return undefined;
  }
  const { pathMatch } = route.params;
  return (Array.isArray(pathMatch) && pathMatch.filter(Boolean).join("/")) || "/";
}

/**
 * The page type known from the route alone: the route name for a named route, `home` for the root (whatever content
 * the store puts there), `undefined` for any other slug URL — see `resolveSlugPageType`.
 */
export function getRoutePageType(route: RouteLocationNormalizedGeneric): string | undefined {
  if (route.path === "/") {
    return HOME_PAGE_TYPE;
  }
  if (getSlugPermalink(route) !== undefined || !route.name) {
    return undefined;
  }
  return snakeCase(String(route.name));
}

/**
 * Same document, variables and cache as the matcher's own query, so the answer is the request the page sends anyway
 * (cached, or shared while in flight) rather than a second one. `undefined` when the lookup fails.
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

    return slugInfo.redirectUrl ? REDIRECT_PAGE_TYPE : NOT_FOUND_PAGE_TYPE;
  } catch (e) {
    Logger.error(DEBUG_PREFIX, "page type lookup failed", e);
    return undefined;
  }
}
