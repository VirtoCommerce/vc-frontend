import { ProductsFacet, ProductsFacetValue, ProductsFilters } from "@/shared/catalog";
import { FacetRangeType, FacetTermType, RangeFacet, TermFacet } from "@/xapi/types";
import { IN_STOCK_FILTER_EXPRESSION } from "@/core/constants";

/**
 * Learn more about filter syntax:
 * https://github.com/VirtoCommerce/vc-module-experience-api/blob/master/docs/filter-syntax.md#filters
 * https://github.com/VirtoCommerce/vc-module-experience-api/blob/master/docs/x-catalog-reference.md#filter-by-price
 */
function getFilterExpressionFromFacetRange(facetRange: FacetRangeType): string {
  const { from, to, includeFrom, includeTo } = facetRange;

  const firstBracket = includeFrom ? "[" : "(";
  const lastBracket = includeTo ? "]" : ")";

  const fromStr = from ? `${from} ` : "";
  const toStr = to ? ` ${to}` : "";

  return `${firstBracket}${fromStr}TO${toStr}${lastBracket}`;
}

/**
 *
 * @param filters
 * @param excludeInStock Exclude in stock parameter from filters query to reduce query string
 * @returns Stringified filters query
 */
export function toFilterExpression(filters: ProductsFilters, excludeInStock?: boolean) {
  const result: string[] = [];

  for (const filter of filters.facets) {
    const selectedValues: string[] = filter.values
      .filter((item) => item.selected) //
      .map((item) => item.value);

    if (!selectedValues.length) {
      continue;
    }

    const conditions =
      filter.type === "term"
        ? `"${selectedValues.join('","')}"` // Terms
        : selectedValues.join(","); // Ranges

    result.push(`"${filter.paramName}":${conditions}`);
  }

  if (filters.inStock && !excludeInStock) {
    result.push(IN_STOCK_FILTER_EXPRESSION);
  }

  return result.join(" ");
}

export function termFacetToProductsFilter(termFacet: TermFacet): ProductsFacet {
  return {
    type: "term",
    label: termFacet.label,
    paramName: termFacet.name,
    values: termFacet
      .terms!.map<ProductsFacetValue>((facetTerm: FacetTermType) => ({
        count: facetTerm.count,
        label: facetTerm.label,
        value: facetTerm.term!,
        selected: facetTerm.isSelected!,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  };
}

export function rangeFacetToProductsFilter(rangeFacet: RangeFacet): ProductsFacet {
  return {
    type: "range",
    label: rangeFacet.label,
    paramName: rangeFacet.name,
    values: rangeFacet.ranges!.map<ProductsFacetValue>((facetRange: FacetRangeType) => ({
      count: facetRange.count,
      label: facetRange.label!,
      value: getFilterExpressionFromFacetRange(facetRange),
      selected: facetRange.isSelected!,
    })),
  };
}
