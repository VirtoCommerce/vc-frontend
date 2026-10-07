// The KPI cards of a dashboard's stat row, generically. A dashboard declares its cards once in a table of
// `IStatCardDefType`s with its own need tokens; `statBlocks` turns that table into `statistics` blocks, the
// dashboard's statistics composables turn it into `StatCardType`s through `buildStatCards`, and
// `statDataNeeds` turns the cards a user can see into what those composables must fetch — so an id, a
// caption and a data dependency each exist in exactly one place.
import type { IStatBlock, StatCardType } from "./types";

/**
 * The half of a KPI card no query decides. `TNeed` is the dashboard's own vocabulary of data needs: tokens
 * that name a card's metric, each standing for whatever the dashboard's queries must ask for to show it.
 */
export interface IStatCardDefType<TNeed extends string = string> {
  /** Layout block id and `StatCardType.key` — one string, both sides. */
  key: string;
  labelKey: string;
  icon: string;
  color: VcStatCardColorType;
  /**
   * Everything the card's own figures come from, so the statistics queries can be shaped from the visible
   * cards instead of a hand-kept union. Declare what the card *renders*: a token is not implied by another,
   * so a card showing a period and its comparison names both.
   */
  needs: readonly TNeed[];
}

/**
 * What is left for the statistics queries to fill in. `loading`/`failed` are excluded on purpose:
 * `buildStatCards` derives them from the card's own `needs`, so a mapper cannot hand a card the wrong
 * pending state and a new card cannot forget one.
 */
export type StatCardDataType = Omit<StatCardType, keyof IStatCardDefType | "loading" | "failed">;

export type StatQueryStateType = { loading: boolean; failed: boolean };

/** Which of the dashboard's queries answers a need, and whether that need's slice is in its response yet. */
export type StatNeedResultType<TQuery extends string> = { query: TQuery; arrived: boolean };

/** The `statistics` blocks for a card table. Order follows the table; a saved document overrides it. */
export function statBlocks(cards: readonly IStatCardDefType[]): IStatBlock[] {
  return cards.map((card, index) => ({
    id: card.key,
    region: "statistics",
    titleKey: card.labelKey,
    order: (index + 1) * 10,
  }));
}

/** The union of the named cards' needs. An id no card matches is ignored — a saved layout may name a card
 * this build no longer ships, exactly as `reconcileLayout` treats it. */
export function statDataNeeds<TNeed extends string>(
  cards: readonly IStatCardDefType<TNeed>[],
  cardIds: Iterable<string>,
): ReadonlySet<TNeed> {
  const wanted = new Set(cardIds);
  const needs = new Set<TNeed>();

  for (const card of cards) {
    if (wanted.has(card.key)) {
      for (const need of card.needs) {
        needs.add(need);
      }
    }
  }

  return needs;
}

/**
 * A card is pending only while a query it reads is in flight AND that query has not delivered the slice
 * this card renders. Entering layout-edit mode widens the needs, which changes the query variables, which
 * restarts the query — so a per-query flag would blank every card fed by it for a full round trip even
 * though its figures are in hand (VCST-5647). A card fails as soon as any query it reads failed.
 */
export function statCardState<TNeed extends string, TQuery extends string>(
  needs: readonly TNeed[],
  table: Readonly<Record<TNeed, StatNeedResultType<TQuery>>>,
  states: Readonly<Record<TQuery, StatQueryStateType>>,
): StatQueryStateType {
  let loading = false;
  let failed = false;

  for (const need of needs) {
    const { query, arrived } = table[need];
    const state = states[query];

    if (state.failed) {
      failed = true;
    }

    if (state.loading && !arrived) {
      loading = true;
    }
  }

  return { loading, failed };
}

/**
 * `data` is a total record over the table's keys, so shipping a card without wiring its value is a
 * compile error rather than a blank tile. Each card's pending/failed state comes from its own `needs`
 * (`statCardState`), so a card whose slice already arrived keeps rendering while a sibling's query is
 * still in flight.
 */
export function buildStatCards<
  TNeed extends string,
  TQuery extends string,
  TDefs extends readonly IStatCardDefType<TNeed>[],
>(
  defs: TDefs,
  data: Record<TDefs[number]["key"], StatCardDataType>,
  queries: {
    table: Readonly<Record<TNeed, StatNeedResultType<TQuery>>>;
    states: Readonly<Record<TQuery, StatQueryStateType>>;
  },
): StatCardType[] {
  return defs.map((def) => ({
    ...def,
    ...data[def.key as TDefs[number]["key"]],
    ...statCardState(def.needs, queries.table, queries.states),
  }));
}
