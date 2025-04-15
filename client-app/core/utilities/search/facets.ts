import { unref } from "vue";
import { globals } from "@/core/globals";
import { isDateString } from "@/core/utilities/date";
import type { FacetItemType, FacetValueItemType } from "../../types";
import type { FacetRangeType, FacetTermType, RangeFacet, TermFacet } from "@/core/api/graphql/types";
import type { MaybeRef } from "@vueuse/core";

/**
 * Learn more about filter syntax:
 * - {@link https://github.com/VirtoCommerce/vc-module-experience-api/blob/master/docs/filter-syntax.md#filters}
 * - {@link https://github.com/VirtoCommerce/vc-module-experience-api/blob/master/docs/x-catalog-reference.md#filter-by-price}
 */

/**
 * Generates a filter expression for category subtree filtering
 * @param payload - Object containing catalogId and optional categoryId
 * @returns A string representing the category subtree filter expression
 */
export function getFilterExpressionForCategorySubtree(payload: { catalogId: string; categoryId?: string }): string {
  return `category.subtree:${payload.catalogId}${payload.categoryId ? "/" + payload.categoryId : ""}`;
}

/**
 * Generates a filter expression for zero price filtering
 * @param value - A reactive boolean value indicating whether to filter zero prices
 * @param currencyCode - Optional currency code for price filtering
 * @returns A string representing the price filter expression
 */
export function getFilterExpressionForZeroPrice(value: MaybeRef<boolean>, currencyCode?: string): string {
  const priceFilterExpression = currencyCode ? `price.${currencyCode}:(0 TO)` : "price:(0 TO)";

  return unref(value) ? "" : priceFilterExpression;
}

/**
 * Generates a filter expression for in-stock filtering
 * @param value - A reactive boolean value indicating whether to filter in-stock items
 * @returns A string representing the availability filter expression
 */
export function getFilterExpressionForInStock(value: MaybeRef<boolean>): string {
  return unref(value) ? "availability:InStock" : "";
}

/**
 * Generates a filter expression for available in branches filtering
 * @param value - A reactive array of branch identifiers
 * @returns A string representing the available in branches filter expression
 */
export function getFilterExpressionForAvailableIn(value: MaybeRef<string[]>): string {
  const branches = unref(value);
  return branches.length ? `available_in:"${branches.join('","')}"` : "";
}

/**
 * Generates a filter expression from selected facet values
 * @param facets - A reactive array of facet items
 * @returns A string representing the combined filter expression from all selected facets
 */
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

/**
 * Generates a filter expression from a facet range
 * @param facetRange - Object containing range parameters (from, to, includeFrom, includeTo)
 * @returns A string representing the range filter expression
 */
export function getFilterExpressionFromFacetRange(
  facetRange: Pick<FacetRangeType, "from" | "to" | "includeFrom" | "includeTo">,
): string {
  const { from, to, includeFrom, includeTo } = facetRange;

  const firstBracket = includeFrom ? "[" : "(";
  const lastBracket = includeTo ? "]" : ")";

  const fromStr = from != undefined ? `${from} ` : "";
  const toStr = to != undefined ? ` ${to}` : "";

  return `${firstBracket}${fromStr}TO${toStr}${lastBracket}`;
}

/**
 * Converts a term facet to a common facet format
 * @param termFacet - The term facet to convert
 * @returns A FacetItemType object representing the converted term facet
 */
export function termFacetToCommonFacet(termFacet: TermFacet): FacetItemType {
  return {
    type: "terms",
    label: termFacet.label,
    paramName: termFacet.name,
    values: termFacet.terms
      .map<FacetValueItemType>((facetTerm: FacetTermType) => ({
        count: facetTerm.count,
        label: getFacetLabel(facetTerm.label),
        value: facetTerm.term,
        selected: facetTerm.isSelected,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  };
}

/**
 * Converts a range facet to a common facet format
 * @param rangeFacet - The range facet to convert
 * @returns A FacetItemType object representing the converted range facet
 */
export function rangeFacetToCommonFacet(rangeFacet: RangeFacet): FacetItemType {
  return {
    type: "range",
    label: rangeFacet.label,
    paramName: rangeFacet.name,
    values: rangeFacet.ranges.map<FacetValueItemType>((facetRange: FacetRangeType) => ({
      count: facetRange.count,
      label: getFacetLabel(facetRange.label),
      value: getFilterExpressionFromFacetRange(facetRange),
      selected: facetRange.isSelected,
    })),
  };
}

/**
 * Formats a facet label based on its type
 * @param label - The label to format
 * @returns A formatted string representing the facet label
 */
function getFacetLabel(label: string): string {
  const { d, t } = globals.i18n.global;

  if (isDateString(label)) {
    return d(new Date(label));
  }

  switch (label.toLowerCase()) {
    case "true":
      return t("common.labels.true_property");
    case "false":
      return t("common.labels.false_property");
    default:
      return label;
  }
}
