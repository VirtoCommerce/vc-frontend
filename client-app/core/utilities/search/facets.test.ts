import { describe, test, expect, beforeEach, vi } from "vitest";
import { ref } from "vue";
import { FacetTypes } from "@/core/api/graphql/types";
import {
  getFilterExpressionFromFacetRange,
  getFilterExpressionForCategorySubtree,
  getFilterExpressionForZeroPrice,
  getFilterExpressionForInStock,
  getFilterExpressionForAvailableIn,
  getFilterExpressionFromFacets,
  termFacetToCommonFacet,
  rangeFacetToCommonFacet,
} from "@/core/utilities";
import type { FacetRangeType, FacetTermType, RangeFacet, TermFacet } from "@/core/api/graphql/types";
import type { FacetItemType, FacetValueItemType } from "@/core/types";

describe("getFilterExpressionFromFacetRange", () => {
  test.each`
    from    | to      | includeFrom | includeTo | expectedString
    ${null} | ${-1.2} | ${true}     | ${false}  | ${"[TO -1.2)"}
    ${null} | ${0}    | ${true}     | ${false}  | ${"[TO 0)"}
    ${null} | ${1.2}  | ${true}     | ${false}  | ${"[TO 1.2)"}
    ${-1.2} | ${null} | ${true}     | ${false}  | ${"[-1.2 TO)"}
    ${0}    | ${null} | ${true}     | ${false}  | ${"[0 TO)"}
    ${0}    | ${null} | ${false}    | ${true}   | ${"(0 TO]"}
    ${0}    | ${null} | ${false}    | ${false}  | ${"(0 TO)"}
    ${1.2}  | ${null} | ${true}     | ${false}  | ${"[1.2 TO)"}
    ${-1.2} | ${0}    | ${true}     | ${false}  | ${"[-1.2 TO 0)"}
    ${0}    | ${1.2}  | ${true}     | ${false}  | ${"[0 TO 1.2)"}
    ${-1.2} | ${1.2}  | ${true}     | ${false}  | ${"[-1.2 TO 1.2)"}
  `(
    "{from: $from, to: $to, includeFrom: $includeFrom, includeTo: $includeTo} -> $expectedString",
    ({ from, to, includeFrom, includeTo, expectedString }) => {
      /* eslint-disable @typescript-eslint/no-unsafe-assignment */
      const facetRange = {
        from,
        to,
        includeFrom,
        includeTo,
      };

      const actualString = getFilterExpressionFromFacetRange(facetRange);

      expect(actualString).toEqual(expectedString);
    },
  );
});

describe("getFilterExpressionForCategorySubtree", () => {
  test.each`
    catalogId     | categoryId     | expected
    ${"catalog1"} | ${undefined}   | ${"category.subtree:catalog1"}
    ${"catalog1"} | ${"category1"} | ${"category.subtree:catalog1/category1"}
  `("with catalogId: $catalogId, categoryId: $categoryId -> $expected", ({ catalogId, categoryId, expected }) => {
    const result = getFilterExpressionForCategorySubtree({ catalogId, categoryId });
    expect(result).toBe(expected);
  });
});

describe("getFilterExpressionForZeroPrice", () => {
  test.each`
    value    | currencyCode | expected
    ${true}  | ${undefined} | ${""}
    ${false} | ${undefined} | ${"price:(0 TO)"}
    ${true}  | ${"USD"}     | ${""}
    ${false} | ${"USD"}     | ${"price.USD:(0 TO)"}
  `("with value: $value, currencyCode: $currencyCode -> $expected", ({ value, currencyCode, expected }) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result = getFilterExpressionForZeroPrice(ref(value), currencyCode);
    expect(result).toBe(expected);
  });
});

describe("getFilterExpressionForInStock", () => {
  test.each`
    value    | expected
    ${true}  | ${"availability:InStock"}
    ${false} | ${""}
  `("with value: $value -> $expected", ({ value, expected }) => {
    const result = getFilterExpressionForInStock(ref(value));
    expect(result).toBe(expected);
  });
});

describe("getFilterExpressionForAvailableIn", () => {
  test.each`
    branches                  | expected
    ${[]}                     | ${""}
    ${["branch1"]}            | ${'available_in:"branch1"'}
    ${["branch1", "branch2"]} | ${'available_in:"branch1","branch2"'}
  `("with branches: $branches -> $expected", ({ branches, expected }) => {
    const result = getFilterExpressionForAvailableIn(ref(branches));
    expect(result).toBe(expected);
  });
});

describe("getFilterExpressionFromFacets", () => {
  test.each`
    facets                                                                                                                                                                                                                                                             | expected
    ${[]}                                                                                                                                                                                                                                                              | ${""}
    ${[{ type: "terms", paramName: "color", label: "Color", values: [{ selected: true, value: "red", label: "Red", count: 1 }] }]}                                                                                                                                     | ${'"color":"red"'}
    ${[{ type: "range", paramName: "price", label: "Price", values: [{ selected: true, value: "[0 TO 100]", label: "0-100", count: 1 }] }]}                                                                                                                            | ${'"price":[0 TO 100]'}
    ${[{ type: "terms", paramName: "color", label: "Color", values: [{ selected: true, value: "red", label: "Red", count: 1 }] }, { type: "range", paramName: "price", label: "Price", values: [{ selected: true, value: "[0 TO 100]", label: "0-100", count: 1 }] }]} | ${'"color":"red" "price":[0 TO 100]'}
  `("with facets: $facets -> $expected", ({ facets, expected }: { facets: FacetItemType[]; expected: string }) => {
    const result = getFilterExpressionFromFacets(ref(facets));
    expect(result).toBe(expected);
  });

  test("handles special characters in facet values", () => {
    const facets: FacetItemType[] = [
      {
        type: "terms",
        paramName: "color",
        label: "Color",
        values: [{ selected: true, value: 'red"blue', label: "Red Blue", count: 1 }],
      },
    ];
    const result = getFilterExpressionFromFacets(ref(facets));
    expect(result).toBe('"color":"red\\"blue"');
  });
});

describe("termFacetToCommonFacet", () => {
  beforeEach(() => {
    // Mock globals.i18n.global
    vi.mock("@/core/globals", () => ({
      globals: {
        i18n: {
          global: {
            d: (date: Date) => {
              // Format date as YYYY-MM-DD for consistency
              return date.toISOString().split("T")[0];
            },
            t: (key: string) => {
              // Handle specific translation keys used in getFacetLabel
              switch (key) {
                case "common.labels.true_property":
                  return "Yes";
                case "common.labels.false_property":
                  return "No";
                default:
                  return key;
              }
            },
          },
        },
      },
    }));
  });

  test("converts term facet to common facet", () => {
    const termFacet: TermFacet = {
      name: "color",
      label: "Color",
      facetType: FacetTypes.Terms,
      terms: [
        { term: "red", count: 5, label: "Red", isSelected: true },
        { term: "blue", count: 3, label: "Blue", isSelected: false },
      ],
    };

    const result = termFacetToCommonFacet(termFacet);
    expect(result).toEqual({
      type: "terms",
      label: "Color",
      paramName: "color",
      values: [
        { value: "blue", count: 3, label: "Blue", selected: false },
        { value: "red", count: 5, label: "Red", selected: true },
      ],
    });
  });

  test("handles date values with proper formatting", () => {
    const termFacet: TermFacet = {
      name: "createdDate",
      label: "Creation Date",
      facetType: FacetTypes.Terms,
      terms: [
        { term: "2024-01-01", count: 5, label: "2024-01-01", isSelected: true },
        { term: "2024-02-01", count: 3, label: "2024-02-01", isSelected: false },
      ],
    };

    const result = termFacetToCommonFacet(termFacet);
    expect(result).toEqual({
      type: "terms",
      label: "Creation Date",
      paramName: "createdDate",
      values: [
        { value: "2024-01-01", count: 5, label: "2024-01-01", selected: true },
        { value: "2024-02-01", count: 3, label: "2024-02-01", selected: false },
      ],
    });
  });
});

describe("rangeFacetToCommonFacet", () => {
  test("converts range facet to common facet", () => {
    const rangeFacet: RangeFacet = {
      name: "price",
      label: "Price",
      facetType: FacetTypes.Range,
      ranges: [
        {
          from: 0,
          to: 100,
          count: 5,
          label: "0-100",
          isSelected: true,
          includeFrom: true,
          includeTo: true,
          max: 100,
          min: 0,
          total: 5,
        },
        {
          from: 100,
          to: 200,
          count: 3,
          label: "100-200",
          isSelected: false,
          includeFrom: true,
          includeTo: true,
          max: 200,
          min: 100,
          total: 3,
        },
      ],
    };

    const result = rangeFacetToCommonFacet(rangeFacet);
    expect(result).toEqual({
      type: "range",
      label: "Price",
      paramName: "price",
      values: [
        { value: "[0 TO 100]", count: 5, label: "0-100", selected: true },
        { value: "[100 TO 200]", count: 3, label: "100-200", selected: false },
      ],
    });
  });
});
