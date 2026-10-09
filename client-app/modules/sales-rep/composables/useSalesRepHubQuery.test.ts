import { describe, expect, it, vi } from "vitest";
import { SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT } from "@/core/api/graphql/consts";
import { SalesRepCustomersCountDocument } from "../api/graphql/types";
import { useSalesRepHubQuery } from "./useSalesRepHubQuery";

const useQuery = vi.hoisted(() => vi.fn(() => ({ result: undefined })));

vi.mock("@vue/apollo-composable", () => ({ useQuery }));

/** The options object the wrapper handed to useQuery. */
function passedOptions(): Record<string, unknown> {
  return (useQuery.mock.calls.at(-1) as unknown[])[2] as Record<string, unknown>;
}

describe("useSalesRepHubQuery", () => {
  it("opts the operation out of the error notifications", () => {
    useSalesRepHubQuery(SalesRepCustomersCountDocument, { storeId: "test-store" });

    expect(passedOptions().context).toEqual(SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT);
  });

  it("keeps the caller's own options", () => {
    useSalesRepHubQuery(SalesRepCustomersCountDocument, { storeId: "test-store" }, { fetchPolicy: "no-cache" });

    expect(passedOptions()).toMatchObject({ fetchPolicy: "no-cache" });
  });

  it("merges a caller context without letting it turn the opt-out off", () => {
    useSalesRepHubQuery(
      SalesRepCustomersCountDocument,
      { storeId: "test-store" },
      { context: { headers: { "x-test": "1" }, suppressErrorNotifications: false } },
    );

    expect(passedOptions().context).toEqual({ headers: { "x-test": "1" }, suppressErrorNotifications: true });
  });
});
