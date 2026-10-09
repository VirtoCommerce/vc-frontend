import { describe, expect, it } from "vitest";
import { TEST_CARDS, TEST_STAT_IDS } from "./layout-test-utils";
import { buildStatCards, statBlocks, statCardState, statDataNeeds } from "./stat-cards";
import type { TestNeedType } from "./layout-test-utils";
import type { StatNeedResultType, StatQueryStateType } from "./stat-cards";

type QueryType = "figures" | "people";

const IDLE: StatQueryStateType = { loading: false, failed: false };
const LOADING: StatQueryStateType = { loading: true, failed: false };
const FAILED: StatQueryStateType = { loading: false, failed: true };

/** `count` and `total` come from one query, `people` from another; `arrived` says which slices are in. */
function table(
  arrived: Partial<Record<TestNeedType, boolean>> = {},
): Record<TestNeedType, StatNeedResultType<QueryType>> {
  return {
    count: { query: "figures", arrived: Boolean(arrived.count) },
    total: { query: "figures", arrived: Boolean(arrived.total) },
    people: { query: "people", arrived: Boolean(arrived.people) },
  };
}

describe("statBlocks", () => {
  it("turns a card table into stat blocks, in table order, captioned like the cards", () => {
    expect(statBlocks(TEST_CARDS)).toEqual([
      { id: "alpha", region: "statistics", titleKey: "test.cards.alpha", order: 10 },
      { id: "beta", region: "statistics", titleKey: "test.cards.beta", order: 20 },
      { id: "gamma", region: "statistics", titleKey: "test.cards.gamma", order: 30 },
      { id: "delta", region: "statistics", titleKey: "test.cards.delta", order: 40 },
    ]);
  });
});

describe("statDataNeeds", () => {
  it("is the union of the named cards' needs", () => {
    expect(statDataNeeds(TEST_CARDS, ["alpha", "gamma"])).toEqual(new Set(["count", "people"]));
    expect(statDataNeeds(TEST_CARDS, TEST_STAT_IDS)).toEqual(new Set(["count", "total", "people"]));
  });

  // A card sharing a need with another must not drop it when the other is hidden.
  it("keeps a shared need while any card that needs it is named", () => {
    expect(statDataNeeds(TEST_CARDS, ["beta"])).toEqual(new Set(["count", "total"]));
  });

  it("asks for nothing when no card is named", () => {
    expect(statDataNeeds(TEST_CARDS, []).size).toBe(0);
  });

  it("ignores an id no card matches, as a stale saved layout may name one", () => {
    expect(statDataNeeds(TEST_CARDS, ["a-card-this-build-dropped"]).size).toBe(0);
  });
});

// VCST-5647: entering edit mode widens the needs and restarts the queries, so a per-query pending flag would
// blank every card fed by a query even though its own slice is already in hand.
describe("statCardState", () => {
  it("keeps a card whose slice arrived out of the pending state while its query reloads", () => {
    const states = { figures: LOADING, people: IDLE };

    expect(statCardState(["count"], table({ count: true }), states)).toEqual({ loading: false, failed: false });
    expect(statCardState(["total"], table({ count: true }), states)).toEqual({ loading: true, failed: false });
  });

  it("is pending while any of the card's own slices is missing", () => {
    const states = { figures: LOADING, people: IDLE };

    expect(statCardState(["count", "total"], table({ count: true }), states).loading).toBe(true);
  });

  it("is not touched by a query the card does not read", () => {
    const states = { figures: IDLE, people: FAILED };

    expect(statCardState(["count"], table(), states)).toEqual({ loading: false, failed: false });
    expect(statCardState(["people"], table(), states)).toEqual({ loading: false, failed: true });
  });
});

describe("buildStatCards", () => {
  const data = {
    alpha: { value: "1" },
    beta: { value: "2", sub: "two" },
    gamma: { value: "3" },
    delta: { value: "4", delta: "+4%", deltaTone: "positive" as const },
  };

  it("merges each card's definition, its figures and its own query state", () => {
    const cards = buildStatCards(TEST_CARDS, data, {
      table: table({ count: true }),
      states: { figures: LOADING, people: FAILED },
    });

    expect(cards.map((card) => [card.key, card.value, card.loading, card.failed])).toEqual([
      ["alpha", "1", false, false],
      ["beta", "2", true, false],
      ["gamma", "3", false, true],
      ["delta", "4", true, false],
    ]);
    expect(cards[1]).toMatchObject({ labelKey: "test.cards.beta", icon: "cart", color: "success", sub: "two" });
  });
});
