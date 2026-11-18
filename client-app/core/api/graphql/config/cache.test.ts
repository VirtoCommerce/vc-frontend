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

  // The stat cards' month to date and the Sales Statistics' current month ask for the same window, so both land on
  // one `period(from, to)` entry, each selecting its own fields of `total`. Neither may knock out the other's.
  it("keeps both selections of one order statistics period when two queries read the same window", () => {
    const cache = new InMemoryCache({ typePolicies: hostTypePolicies });
    const cardsQuery = gql`
      query Cards {
        orderStatistics(storeId: "B2B-store") {
          mtd: period(from: "2026-11-01", to: "2026-11-02") {
            count
            total {
              formattedAmount
            }
          }
        }
      }
    `;
    const reportQuery = gql`
      query Report {
        orderStatistics(storeId: "B2B-store") {
          m10: period(from: "2026-11-01", to: "2026-11-02") {
            count
            total {
              amount
            }
          }
        }
      }
    `;
    const cards = {
      orderStatistics: {
        __typename: "OrderStatistics",
        mtd: {
          __typename: "OrderStatisticsPeriod",
          count: 3,
          total: { __typename: "MoneyType", formattedAmount: "$300.00" },
        },
      },
    };
    const report = {
      orderStatistics: {
        __typename: "OrderStatistics",
        m10: { __typename: "OrderStatisticsPeriod", count: 3, total: { __typename: "MoneyType", amount: 300 } },
      },
    };

    cache.writeQuery({ query: cardsQuery, data: cards });
    cache.writeQuery({ query: reportQuery, data: report });

    expect(cache.readQuery({ query: cardsQuery })).toEqual(cards);
    expect(cache.readQuery({ query: reportQuery })).toEqual(report);
  });
});
