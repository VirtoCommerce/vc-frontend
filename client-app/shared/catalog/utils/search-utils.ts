import { unref } from "vue";
import { MaybeRef } from "@vueuse/core";
import { ProductsFacet, ProductsFacetValue } from "@/shared/catalog";
import { FacetRangeType, FacetTermType, RangeFacet, TermFacet } from "@/xapi/types";

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

export function getFilterExpressionFromFacets(facets: MaybeRef<ProductsFacet[]>): string {
  const result: string[] = [];

  for (const facet of unref(facets)) {
    const selectedValues: string[] = facet.values
      .filter((item) => item.selected) //
      .map((item) => item.value);

    if (!selectedValues.length) {
      continue;
    }

    const conditions =
      facet.type === "term"
        ? `"${selectedValues.join('","')}"` // Terms
        : selectedValues.join(","); // Ranges

    result.push(`"${facet.paramName}":${conditions}`);
  }

  return result.join(" ");
}

export function getFilterExpressionForInStock(value: MaybeRef<boolean>): string {
  return unref(value) ? "instock_quantity:(0 TO)" : "";
}

export function getFilterExpressionForAvailableIn(value: MaybeRef<string[]>): string {
  return unref(value).length ? `available_in:${unref(value).join(',')}` : "";
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
