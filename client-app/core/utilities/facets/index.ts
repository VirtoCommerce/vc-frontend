import { unref } from "vue";
import { MaybeRef } from "@vueuse/core";
import { FacetItem, FacetValueItem, RangeFilterValue } from "@/core";
import { FacetRangeType, FacetTermType, RangeFacet, TermFacet } from "@/xapi/types";

/**
 * Learn more about filter syntax:
 * - {@link https://github.com/VirtoCommerce/vc-module-experience-api/blob/master/docs/filter-syntax.md#filters}
 * - {@link https://github.com/VirtoCommerce/vc-module-experience-api/blob/master/docs/x-catalog-reference.md#filter-by-price}
 */

export function getFilterExpressionFromFacets(facets: MaybeRef<FacetItem[]>): string {
  const result: string[] = [];

  for (const facet of unref(facets)) {
    const selectedValues: string[] = facet.values
      .filter((item) => item.selected) //
      .map((item) => item.value);

    if (!selectedValues.length) {
      continue;
    }

    const conditions =
      facet.type === "terms"
        ? `"${selectedValues.join('","')}"` // Terms
        : selectedValues.join(","); // Ranges

    result.push(`"${facet.paramName}":${conditions}`);
  }

  return result.join(" ");
}

/**
 * @deprecated Use Range<T> instead
 */
export function getFilterExpressionFromFacetRange(facetRange: FacetRangeType): string {
  const rangeValue = RangeFilterValue.fromFacetRange(facetRange);
  const result = rangeValue.toString();
  return result;
}

export function termFacetToCommonFacet(termFacet: TermFacet): FacetItem {
  return {
    type: "terms",
    label: termFacet.label,
    paramName: termFacet.name,
    values: termFacet
      .terms!.map<FacetValueItem>((facetTerm: FacetTermType) => ({
        count: facetTerm.count,
        label: facetTerm.label,
        value: facetTerm.term!,
        selected: facetTerm.isSelected!,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  };
}

export function rangeFacetToCommonFacet(rangeFacet: RangeFacet): FacetItem {
  return {
    type: "range",
    label: rangeFacet.label,
    paramName: rangeFacet.name,
    values: rangeFacet.ranges!.map<FacetValueItem>((facetRange: FacetRangeType) => ({
      count: facetRange.count,
      label: facetRange.label!,
      value: getFilterExpressionFromFacetRange(facetRange),
      selected: facetRange.isSelected!,
    })),
  };
}
