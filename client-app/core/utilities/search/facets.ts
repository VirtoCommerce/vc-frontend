import { unref } from "vue";
import { RangeFilterValue } from "@/core/types/search/filtering";
import type { FacetItemType, FacetValueItemType } from "@/core/types/facet";
import type { FacetRangeType, FacetTermType, RangeFacet, TermFacet } from "@/xapi/types";
import type { MaybeRef } from "@vueuse/core";

/**
 * Learn more about filter syntax:
 * - {@link https://github.com/VirtoCommerce/vc-module-experience-api/blob/master/docs/filter-syntax.md#filters}
 * - {@link https://github.com/VirtoCommerce/vc-module-experience-api/blob/master/docs/x-catalog-reference.md#filter-by-price}
 */

export function getFilterExpressionFromFacets(facets: MaybeRef<FacetItemType[]>): string {
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

export function termFacetToCommonFacet(termFacet: TermFacet): FacetItemType {
  return {
    type: "terms",
    label: termFacet.label,
    paramName: termFacet.name,
    values: termFacet
      .terms!.map<FacetValueItemType>((facetTerm: FacetTermType) => ({
        count: facetTerm.count,
        label: facetTerm.label,
        value: facetTerm.term!,
        selected: facetTerm.isSelected!,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  };
}

export function rangeFacetToCommonFacet(rangeFacet: RangeFacet): FacetItemType {
  return {
    type: "range",
    label: rangeFacet.label,
    paramName: rangeFacet.name,
    values: rangeFacet.ranges!.map<FacetValueItemType>((facetRange: FacetRangeType) => ({
      count: facetRange.count,
      label: facetRange.label!,
      value: RangeFilterValue.fromFacetRange(facetRange).toString(),
      selected: facetRange.isSelected!,
    })),
  };
}
