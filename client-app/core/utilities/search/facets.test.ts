import { describe, test, expect } from "vitest";
import { getFilterExpressionFromFacetRange } from "@/core/utilities";

describe("getFilterExpressionFromFacetRange", () => {
  test.each`
    from    | to      | includeFrom | includeTo | expectedString
    ${null} | ${-1.2} | ${true}     | ${false}  | ${"[TO -1.2)"}
    ${null} | ${0}    | ${true}     | ${false}  | ${"[TO 0)"}
    ${null} | ${1.2}  | ${true}     | ${false}  | ${"[TO 1.2)"}
    ${-1.2} | ${null} | ${true}     | ${false}  | ${"[-1.2 TO)"}
    ${0}    | ${null} | ${true}     | ${false}  | ${"[0 TO)"}
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
