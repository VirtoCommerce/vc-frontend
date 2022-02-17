import { LocationQuery } from "vue-router";
import {
  FromRouteQueryOptions,
  ProductsSearchParams,
  ProductsFilter,
  ProductsFilterValue,
  SearchQueryParamNames,
} from "@/shared/catalog";
import { FacetRangeType, FacetTermType, RangeFacet, TermFacet } from "@core/api/graphql/types";
import { defaultPageSize } from "@core/constants";
import { unref } from "vue";
import { MaybeRef } from "@vueuse/core";

/**
 * Learn more about filter syntax:
 * https://github.com/VirtoCommerce/vc-module-experience-api/blob/master/docs/filter-syntax.md#filters
 * https://github.com/VirtoCommerce/vc-module-experience-api/blob/master/docs/x-catalog-reference.md#filter-by-price
 */
function getFilterExpressionFromFacetRange(facetRange: FacetRangeType): string {
  const { from, to } = facetRange;

  const firstCondition = from ? `[${from} ` : "(";
  const lastCondition = to ? ` ${to}]` : ")";

  return `${firstCondition}TO${lastCondition}`;
}

function fromFilterUrlParamValue(value: string): string {
  // add logic if necessary
  return value;
}

function toFilterUrlParamValue(filterExpression: string): string {
  // add logic if necessary
  return filterExpression;
}

export function fromRouteQuery(query: LocationQuery, options: FromRouteQueryOptions): ProductsSearchParams {
  const { sortList, itemsPerPageList, defaultSortBy = "", defaultItemsPerPage = defaultPageSize } = options;
  const {
    [SearchQueryParamNames.Page]: pageFromQuery,
    [SearchQueryParamNames.Sort]: sortFromQuery,
    [SearchQueryParamNames.Filter]: filterFromQuery,
    [SearchQueryParamNames.Keyword]: keywordFromQuery,
    [SearchQueryParamNames.ItemsPerPage]: sizeFromQuery,
  } = query;

  const page = Number(pageFromQuery);
  const size = Number(sizeFromQuery);
  const sort = String(sortFromQuery);

  return {
    page: page > 0 ? page : 1,
    keyword: typeof keywordFromQuery === "string" ? keywordFromQuery : "",
    filter: typeof filterFromQuery === "string" ? fromFilterUrlParamValue(filterFromQuery) : "",
    sort: !sortList || sortList.includes(sort) ? sort : defaultSortBy,
    itemsPerPage: !itemsPerPageList || itemsPerPageList.includes(size) ? size : defaultItemsPerPage,
  };
}

export function toRouteQuery(params: ProductsSearchParams): LocationQuery {
  const { sort, keyword, itemsPerPage, page, filter } = params;

  return {
    [SearchQueryParamNames.Filter]: filter ? toFilterUrlParamValue(filter) : undefined,
    [SearchQueryParamNames.Sort]: sort || undefined,
    [SearchQueryParamNames.Keyword]: keyword || undefined,
    [SearchQueryParamNames.Page]: page?.toString(),
    [SearchQueryParamNames.ItemsPerPage]: itemsPerPage?.toString(),
  } as LocationQuery;
}

export function toFilterExpression(filters: MaybeRef<ProductsFilter[]>) {
  const result: string[] = [];

  for (const filter of unref(filters)) {
    const selectedValues: string[] = filter.values
      .filter((item) => item.selected) //
      .map((item) => item.value);

    if (!selectedValues.length) continue;

    const conditions =
      filter.type === "term"
        ? `"${selectedValues.join('","')}"` // Terms
        : selectedValues.join(","); // Ranges

    result.push(`"${filter.paramName}":${conditions}`);
  }

  return result.join(" ");
}

export function termFacetToProductsFilter(termFacet: TermFacet): ProductsFilter {
  return {
    type: "term",
    label: termFacet.label,
    paramName: termFacet.name,
    values: termFacet
      .terms!.map<ProductsFilterValue>((facetTerm: FacetTermType) => ({
        count: facetTerm.count,
        label: facetTerm.label,
        value: facetTerm.term!,
        selected: facetTerm.isSelected!,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  };
}

export function rangeFacetToProductsFilter(rangeFacet: RangeFacet): ProductsFilter {
  return {
    type: "range",
    label: rangeFacet.label,
    paramName: rangeFacet.name,
    values: rangeFacet.ranges!.map<ProductsFilterValue>((facetRange: FacetRangeType) => ({
      count: facetRange.count,
      label: facetRange.label!,
      value: getFilterExpressionFromFacetRange(facetRange),
      selected: facetRange.isSelected!,
    })),
  };
}
