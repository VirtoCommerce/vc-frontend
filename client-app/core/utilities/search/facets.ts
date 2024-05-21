import { unref } from "vue";
import { globals } from "@/core/globals";
import type { FacetItemType, FacetValueItemType } from "../../types";
import type { FacetRangeType, FacetTermType, RangeFacet, TermFacet } from "@/core/api/graphql/types";
import type { MaybeRef } from "@vueuse/core";

/**
 * Learn more about filter syntax:
 * - {@link https://github.com/VirtoCommerce/vc-module-experience-api/blob/master/docs/filter-syntax.md#filters}
 * - {@link https://github.com/VirtoCommerce/vc-module-experience-api/blob/master/docs/x-catalog-reference.md#filter-by-price}
 */

export function getFilterExpressionForCategorySubtree(payload: { catalogId: string; categoryId?: string }): string {
  return `category.subtree:${payload.catalogId}${payload.categoryId ? "/" + payload.categoryId : ""}`;
}

export function getFilterExpressionForZeroPrice(value: MaybeRef<boolean>, currencyCode?: string): string {
  const priceFilterExpression = currencyCode ? `price.${currencyCode}:(0 TO)` : "price:(0 TO)";

  return unref(value) ? "" : priceFilterExpression;
}

export function getFilterExpressionForInStock(value: MaybeRef<boolean>): string {
  return unref(value) ? "availability:InStock" : "";
}

export function getFilterExpressionForAvailableIn(value: MaybeRef<string[]>): string {
  const branches = unref(value);
  return branches.length ? `available_in:"${branches.join('","')}"` : "";
}

export function getFilterExpressionFromFacets(facets: MaybeRef<FacetItemType[]>): string {
  const result: string[] = [];

  for (const facet of unref(facets)) {
    const selectedValues: string[] = facet.values
      .filter((item) => item.selected)
      .map((item) =>
        item.value
          // https://github.com/VirtoCommerce/vc-module-experience-api/blob/dev/docs/filter-syntax.md#escaping-special-characters
          .replace(/\\/g, "\\\\")
          .replace(/"/g, '\\"'),
      );

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

export function getFilterExpressionFromFacetRange(
  facetRange: Pick<FacetRangeType, "from" | "to" | "includeFrom" | "includeTo">,
): string {
  const { from, to, includeFrom, includeTo } = facetRange;

  const firstBracket = includeFrom ? "[" : "(";
  const lastBracket = includeTo ? "]" : ")";

  const fromStr = `${from} `;
  const toStr = to ? ` ${to}` : "";

  return `${firstBracket}${fromStr}TO${toStr}${lastBracket}`;
}

export function termFacetToCommonFacet(termFacet: TermFacet): FacetItemType {
  return {
    type: "terms",
    label: termFacet.label,
    paramName: termFacet.name,
    values: termFacet
      .terms!.map<FacetValueItemType>((facetTerm: FacetTermType) => ({
        count: facetTerm.count,
        label: getFacetLabel(facetTerm.label),
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
      label: getFacetLabel(facetRange.label!),
      value: getFilterExpressionFromFacetRange(facetRange),
      selected: facetRange.isSelected!,
    })),
  };
}

function getFacetLabel(label: string): string {
  const { t } = globals.i18n.global;

  switch (label.toLowerCase()) {
    case "true":
      return t("common.labels.true_property");
    case "false":
      return t("common.labels.false_property");
    default:
      return label;
  }
}
