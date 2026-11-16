import { gql, InMemoryCache } from "@apollo/client/core";
import { describe, expect, it } from "vitest";
import { hostTypePolicies } from "./cache";

// The account dashboard asks for the periods of its visible cards only (`@include` flags), so the same
// `orderStatistics` field is written again with another set of periods whenever the visible cards change.
const weekQuery = gql`
  query WeekStatistics {
    orderStatistics(storeId: "B2B-store") {
      week: period(from: "2026-10-19") {
        count
      }
    }
  }
`;

const yearQuery = gql`
  query YearStatistics {
    orderStatistics(storeId: "B2B-store") {
      ytd: period(from: "2026-01-01") {
        count
      }
    }
  }
`;

describe("hostTypePolicies", () => {
  it("keeps the order statistics periods already read when another set of periods arrives", () => {
    const cache = new InMemoryCache({ typePolicies: hostTypePolicies });

    cache.writeQuery({
      query: weekQuery,
      data: {
        orderStatistics: { __typename: "OrderStatistics", week: { __typename: "OrderStatisticsPeriod", count: 2 } },
      },
    });
    cache.writeQuery({
      query: yearQuery,
      data: {
        orderStatistics: { __typename: "OrderStatistics", ytd: { __typename: "OrderStatisticsPeriod", count: 9 } },
      },
    });

    expect(cache.readQuery({ query: weekQuery })).toEqual({
      orderStatistics: { __typename: "OrderStatistics", week: { __typename: "OrderStatisticsPeriod", count: 2 } },
    });
  });
});
