import { ApolloError } from "@apollo/client/core";

export const UNHANDLED_ERROR_CODE = "UNHANDLED";
export const NETWORK_ERROR_CODE = "NETWORK";

/**
 * A code, never a message: a message is free text and can carry what the server knows about the customer, and
 * reports cannot group on it.
 */
export function getAnalyticsErrorCode(error: unknown): string {
  if (error instanceof ApolloError) {
    const code = error.graphQLErrors.map((graphQLError) => graphQLError.extensions?.code).find(isNonEmptyString);

    if (code) {
      return code;
    }

    if (error.networkError) {
      return NETWORK_ERROR_CODE;
    }
  }

  return UNHANDLED_ERROR_CODE;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}
