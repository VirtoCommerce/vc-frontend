import { describe, expect, it } from "vitest";
import { getFieldValidationErrors } from "./utils";
import type { GraphQLFormattedError } from "graphql";

function graphQLError(extensions?: Record<string, unknown>): GraphQLFormattedError {
  return { message: "message", extensions };
}

describe("getFieldValidationErrors", () => {
  it("returns the field and the rule of every rejected input", () => {
    const errors = [
      graphQLError({ code: "VALIDATION", field: "lastName", errorCode: "InvalidCharacters" }),
      graphQLError({ code: "VALIDATION", field: "addresses[0].city" }),
    ];

    expect(getFieldValidationErrors(errors)).toEqual([
      { field: "lastName", errorCode: "InvalidCharacters" },
      { field: "addresses[0].city", errorCode: undefined },
    ]);
  });

  // An older backend sends VALIDATION without naming the field, and other codes aren't about input at all
  it("skips errors that don't name a rejected field", () => {
    const errors = [
      graphQLError({ code: "VALIDATION" }),
      graphQLError({ code: "VALIDATION", field: "" }),
      graphQLError({ code: "Forbidden", field: "lastName" }),
      graphQLError(),
    ];

    expect(getFieldValidationErrors(errors)).toEqual([]);
  });

  it("returns nothing when there are no errors", () => {
    expect(getFieldValidationErrors(undefined)).toEqual([]);
  });
});
