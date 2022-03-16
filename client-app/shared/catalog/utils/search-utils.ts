import { ProductsFilter, ProductsFilterValue } from "@/shared/catalog";
import { FacetRangeType, FacetTermType, RangeFacet, TermFacet } from "@core/api/graphql/types";
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
