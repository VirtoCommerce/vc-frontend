import { ApolloClient, ApolloLink, Observable } from "@apollo/client/core";
import { provideApolloClient } from "@vue/apollo-composable";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, ref } from "vue";
import { cache } from "@/core/api/graphql/config/cache";
import { useStatDataNeeds } from "@/shared/dashboard";
import { DASHBOARD_STAT_CARDS } from "../layout/stat-cards";
import { useSalesRepOrderStatistics } from "./useSalesRepOrderStatistics";

/**
 * Entering layout-edit mode widens `needs` to every card, which changes the document's `@include` flags,
 * which changes the query variables. apollo-composable watches those deeply and restarts the query
 * (`applyVariables` -> `restart` -> nextTick(stop(); start())), and `start()` sets `loading = true`.
 *
 * The link here is GATED: a response only lands when the test releases it, so "how long is the row
 * blank" is measurable rather than a race.
 */
vi.mock("@/core/globals", () => ({
  globals: { storeId: "test-store", currencyCode: "USD", cultureName: "en-US" },
}));

const money = (amount: number) => ({ __typename: "MoneyType", amount, formattedAmount: `$${amount}` });
const period = (count: number) => ({
  __typename: "CustomerOrderStatisticsPeriod",
  count,
  total: money(count * 10),
  average: money(10),
});
const comparison = () => ({ __typename: "CustomerOrderStatisticsComparison", countChangePercent: 1 });

// A superset of the aliases: Apollo reads only the ones the directives left in the document.
const orderStatistics = () => ({
  salesRepCustomerOrderStatistics: {
    __typename: "CustomerOrderStatistics",
    currencyCode: "USD",
    mtd: period(1),
    ytd: period(1),
    week: period(1),
    newOrders: period(1),
    recentOrders: period(1),
    weekVsPrevWeek: comparison(),
    mtdVsPrevMonth: comparison(),
    ytdVsLastYear: comparison(),
  },
});

let releases: (() => void)[] = [];
let requestCount = 0;

const link = new ApolloLink(
  () =>
    new Observable((observer) => {
      requestCount += 1;
      releases.push(() => {
        observer.next({ data: orderStatistics() });
        observer.complete();
      });
    }),
);

function release(): void {
  const queued = releases;
  releases = [];
  queued.forEach((fn) => fn());
}

async function settle(times = 3): Promise<void> {
  for (let i = 0; i < times; i += 1) {
    await nextTick();
    await new Promise((resolve) => setTimeout(resolve));
  }
}

const everyCard = DASHBOARD_STAT_CARDS.map((card) => card.key);
// Hiding an order-fed card is what makes edit mode widen the flags; a rep with everything visible sees
// no variable change at all, which is why this only bites the reps the feature is for.
const withoutWeek = everyCard.filter((key) => key !== "orders_placed_week");

/** The dashboard page's layout, read and showing `visible`; flipping `editing` is the rep opening the editor. */
function dashboardLayout(visible: readonly string[]) {
  const editing = ref(false);
  const layout = { settled: ref(true), editing, visibleIn: () => visible };
  return { editing, stats: useStatDataNeeds(layout, DASHBOARD_STAT_CARDS) };
}

beforeEach(async () => {
  releases = [];
  requestCount = 0;
  await cache.reset({ discardWatches: true });
  provideApolloClient(new ApolloClient({ link, cache }));
});

describe("entering layout-edit mode", () => {
  it("puts the order statistics back into loading, with the fetched figures still in hand", async () => {
    const owner = effectScope();
    const { editing, stats } = owner.run(() => dashboardLayout(withoutWeek))!;
    const { statistics, loading } = owner.run(() => useSalesRepOrderStatistics(stats))!;

    await settle();
    release();
    await settle();

    expect(loading.value).toBe(false);
    expect(statistics.value?.mtd?.count).toBe(1);
    expect(requestCount).toBe(1);

    // The rep opens the layout editor. Same visible set — only `editing` flips.
    editing.value = true;
    await settle();

    // The widened flags are a new cache key, so nothing can be served from cache: the query is in flight,
    // and VcStatCard puts `loading` ahead of the value, so every order-fed card renders "—".
    expect(loading.value).toBe(true);
    expect(requestCount).toBe(2);

    // The figures do survive the restart — but only because of `keepPreviousResult`. Without it apollo's
    // start() re-emits getCurrentResult() over the new (empty) cache entry and `result` goes undefined,
    // which would leave a per-card pending flag with nothing to render either.
    expect(statistics.value?.mtd?.count).toBe(1);

    release();
    await settle();
    expect(loading.value).toBe(false);

    owner.stop();
  });

  it("does not refetch for a rep with every card visible", async () => {
    const owner = effectScope();
    const { editing, stats } = owner.run(() => dashboardLayout(everyCard))!;
    const { loading } = owner.run(() => useSalesRepOrderStatistics(stats))!;

    await settle();
    release();
    await settle();
    expect(loading.value).toBe(false);
    expect(requestCount).toBe(1);

    editing.value = true;
    await settle();

    // Widening a set that is already complete leaves the flags identical, so apollo sees no new variables.
    expect(requestCount).toBe(1);
    expect(loading.value).toBe(false);

    owner.stop();
  });
});
