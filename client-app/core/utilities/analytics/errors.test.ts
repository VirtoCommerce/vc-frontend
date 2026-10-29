import { ApolloError } from "@apollo/client/core";
import { describe, it, expect } from "vitest";
import { getAnalyticsErrorCode, NETWORK_ERROR_CODE, UNHANDLED_ERROR_CODE } from "./errors";
import type { GraphQLFormattedError } from "graphql";

function apolloError(graphQLErrors: GraphQLFormattedError[], networkError?: Error): ApolloError {
  return new ApolloError({ graphQLErrors, networkError });
}

describe("getAnalyticsErrorCode", () => {
  it("returns the first GraphQL error code", () => {
    const error = apolloError([
      { message: "Jane Doe cannot submit", extensions: {} },
      { message: "Forbidden", extensions: { code: "FORBIDDEN" } },
    ]);

    expect(getAnalyticsErrorCode(error)).toBe("FORBIDDEN");
  });

  // The message is free text and may carry what the server knows about the customer.
  it("never returns the message", () => {
    const error = apolloError([{ message: "Jane Doe <jane@example.com> cannot submit" }]);

    expect(getAnalyticsErrorCode(error)).toBe(UNHANDLED_ERROR_CODE);
  });

  it("marks a network failure", () => {
    expect(getAnalyticsErrorCode(apolloError([], new Error("Failed to fetch")))).toBe(NETWORK_ERROR_CODE);
  });

  it("falls back for anything else", () => {
    expect(getAnalyticsErrorCode(new Error("boom"))).toBe(UNHANDLED_ERROR_CODE);
    expect(getAnalyticsErrorCode("string")).toBe(UNHANDLED_ERROR_CODE);
  });
});
