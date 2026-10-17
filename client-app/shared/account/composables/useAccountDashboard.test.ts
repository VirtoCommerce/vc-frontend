import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { computed, effectScope, ref } from "vue";
import { createI18n } from "@/i18n";
import { ACCOUNT_DASHBOARD_CARDS } from "../dashboard-blocks";
import {
  accountCardData,
  needsOrderStatistics,
  orderStatisticsFlags,
  statNeedResults,
  useAccountDashboard,
} from "./useAccountDashboard";
import type { AccountStatNeedType } from "../dashboard-blocks";
import type { GetOrderStatisticsQuery } from "@/core/api/graphql/types";
import type { LocaleMessage } from "@intlify/core-base";
import type { EffectScope, Ref } from "vue";

const query = await vi.hoisted(async () => {
  const { ref: createRef, shallowRef } = await import("vue");
  return {
    result: shallowRef<GetOrderStatisticsQuery | undefined>(undefined),
    loading: createRef(false),
    error: createRef<Error | undefined>(),
    variables: undefined as Readonly<Ref<Record<string, unknown>>> | undefined,
    enabled: undefined as Readonly<Ref<boolean>> | undefined,
  };
});

vi.mock("@/core/api/graphql/orders/queries/getOrderStatistics", () => ({
  useGetOrderStatisticsQuery: (variables: Readonly<Ref<Record<string, unknown>>>, enabled: Readonly<Ref<boolean>>) => {
    query.variables = variables;
    query.enabled = enabled;
    return { result: query.result, loading: query.loading, error: query.error, onError: vi.fn() };
  },
}));
vi.mock("@/core/globals", () => ({ globals: { storeId: "B2B-store", currencyCode: "USD", cultureName: "en-US" } }));
vi.mock("@/core/utilities", () => ({ Logger: { error: vi.fn(), warn: vi.fn() } }));
vi.mock("vue-i18n", async (importOriginal) => ({
  ...(await importOriginal<typeof import("vue-i18n")>()),
  useI18n: () => ({ t: (key: string) => key }),
}));

type OrderStatisticsType = NonNullable<GetOrderStatisticsQuery["orderStatistics"]>;

const LOCALE_FILE = /([a-z]{2})\.json$/;
const LOCALE_MESSAGES: Record<string, LocaleMessage> = Object.fromEntries(
  Object.entries(import.meta.glob<{ default: LocaleMessage }>("../../../../locales/*.json", { eager: true })).map(
    ([filePath, module]) => [LOCALE_FILE.exec(filePath)?.[1], module.default],
  ),
);

/** The real messages of one locale, with no fallback: a missing key comes back as the key itself. */
function translatorFor(locale: string) {
  const i18n = createI18n(locale, "USD");
  i18n.global.setLocaleMessage(locale, LOCALE_MESSAGES[locale]);
  i18n.global.locale.value = locale;
  return i18n.global;
}

const money = (formattedAmount: string) => ({ formattedAmount });

// Every slice, as the query returns it with every card visible.
const STATISTICS: OrderStatisticsType = {
  currencyCode: "USD",
  week: { count: 3, total: money("$300.00"), excludedCount: 0 },
  mtd: { count: 1234, total: money("$12,340.00"), excludedCount: 2 },
  ytd: { count: 40, total: money("$4,000.00"), excludedCount: 1, average: money("$100.00") },
  weekOverWeek: { countChangePercent: 12.4 },
  monthOverMonth: { countChangePercent: -3.6 },
  // The backend's answer when last year had no orders: no baseline, so no percent (null on the wire, which the
  // generated types read as absent).
  yearOverYear: {},
};

const everyCard = ACCOUNT_DASHBOARD_CARDS.map((card) => card.key);

describe("the account cards' figures", () => {
  const { t } = translatorFor("en");

  it("shows each period's order count, its total, and the change in count against the previous period", () => {
    const data = accountCardData(STATISTICS, t);

    expect(data.orders_placed_week).toMatchObject({
      value: "3",
      sub: "$300.00",
      delta: "+12% vs last week",
      deltaTone: "positive",
      deltaIcon: "chevron-up",
    });
    expect(data.orders_placed_mtd).toMatchObject({
      value: "1,234",
      delta: "-4% vs last month",
      deltaTone: "negative",
      deltaIcon: "chevron-down",
    });
  });

  // A percent against nothing would be invented; the card shows no comparison at all, as the hub's cards do.
  it("shows no comparison when the previous period had no orders", () => {
    const ytd = accountCardData(STATISTICS, t).orders_placed_ytd;

    expect(ytd.delta).toBe("");
    expect(ytd.deltaTone).toBeUndefined();
    expect(ytd.deltaIcon).toBeUndefined();
  });

  it("shows the average order value of the year so far", () => {
    expect(accountCardData(STATISTICS, t).avg_order_value).toMatchObject({
      value: "$100.00",
      sub: "Average per order (YTD) · 1 order in another currency not included",
    });
  });

  // The totals cover only the orders the store could convert; the card says how many it left out.
  it("says how many orders a period left out, in the period's own card", () => {
    const data = accountCardData(STATISTICS, t);

    expect(data.orders_placed_week.sub).toBe("$300.00");
    expect(data.orders_placed_mtd.sub).toBe("$12,340.00 · 2 orders in other currencies not included");
    expect(data.orders_placed_ytd.sub).toBe("$4,000.00 · 1 order in another currency not included");
  });

  // An absent metric reads as zero in the store's currency, never as a blank.
  it("reads zero for a period with no slice yet", () => {
    const data = accountCardData(undefined, t);

    expect(data.orders_placed_week).toMatchObject({ value: "0", sub: "$0.00", delta: "" });
    expect(data.avg_order_value).toMatchObject({ value: "$0.00", sub: "Average per order (YTD)" });
  });
});

describe("the account cards in every locale", () => {
  it("covers all 13 storefront languages", () => {
    expect(new Set(Object.keys(LOCALE_MESSAGES))).toEqual(
      new Set(["de", "en", "es", "fi", "fr", "it", "ja", "no", "pl", "pt", "ru", "sv", "zh"]),
    );
  });

  // The delta keys are passed around as values, so no grep finds them; resolving the mapper's output against each
  // locale's own messages does.
  it.each(Object.keys(LOCALE_MESSAGES))("%s: translates every caption, comparison and note", (locale) => {
    const { t, te } = translatorFor(locale);
    const statistics = { ...STATISTICS, yearOverYear: { countChangePercent: 5 } };
    const texts = Object.values(accountCardData(statistics, t)).flatMap((card) => [card.sub ?? "", card.delta ?? ""]);

    for (const card of ACCOUNT_DASHBOARD_CARDS) {
      expect(te(card.labelKey), card.labelKey).toBe(true);
    }
    for (const text of texts) {
      expect(text).not.toContain("shared.account.dashboard");
    }
  });

  // Slavic locales carry four forms (none | one | few | many, client-app/i18n.ts); the note must pick by grammar.
  it("words the left-out note by the locale's plural rules", () => {
    const { t } = translatorFor("ru");
    const noteFor = (excludedCount: number) =>
      accountCardData({ ...STATISTICS, mtd: { count: 1234, total: money("$12,340.00"), excludedCount } }, t)
        .orders_placed_mtd.sub;

    expect(noteFor(1)).toBe("$12,340.00 · Не учтён 1 заказ в другой валюте");
    expect(noteFor(2)).toBe("$12,340.00 · Не учтены 2 заказа в других валютах");
    expect(noteFor(5)).toBe("$12,340.00 · Не учтено 5 заказов в других валютах");
  });
});

describe("what the account cards ask for", () => {
  const needsOf = (...cards: string[]) =>
    new Set(ACCOUNT_DASHBOARD_CARDS.filter((card) => cards.includes(card.key)).flatMap((card) => card.needs));

  it("turns the visible cards' needs into the query's flags", () => {
    expect(orderStatisticsFlags(needsOf("orders_placed_week"))).toEqual({
      withWeek: true,
      withMtd: false,
      withMonthOverMonth: false,
      withYtd: false,
      withYearOverYear: false,
      withAverageOrderValue: false,
    });
    expect(orderStatisticsFlags(needsOf("avg_order_value"))).toMatchObject({
      withYtd: true,
      withAverageOrderValue: true,
      withYearOverYear: false,
    });
  });

  it("has nothing to fetch with no card visible", () => {
    expect(needsOrderStatistics(new Set())).toBe(false);
    expect(needsOrderStatistics(needsOf(...everyCard))).toBe(true);
  });

  // `average` is a field of the `ytd` bucket: on its own it would select nothing.
  it("does not fetch for the average alone", () => {
    expect(needsOrderStatistics(new Set<AccountStatNeedType>(["averageOrderValue"]))).toBe(false);
  });

  it("reads each need's slice back out of the response", () => {
    const results = statNeedResults({ ...STATISTICS, ytd: undefined, yearOverYear: undefined });

    expect(results.week).toEqual({ query: "orders", arrived: true });
    expect(results.ytd.arrived).toBe(false);
    expect(results.yearOverYear.arrived).toBe(false);
    expect(results.averageOrderValue.arrived).toBe(false);
  });
});

describe("useAccountDashboard", () => {
  const settled = ref(true);
  const editing = ref(false);
  const visible = ref<string[]>([...everyCard]);
  const layout = {
    settled: computed(() => settled.value),
    editing: computed(() => editing.value),
    visibleIn: () => visible.value,
  };

  let scopes: EffectScope[] = [];

  function dashboard() {
    const owner = effectScope();
    scopes.push(owner);
    return owner.run(() => useAccountDashboard(layout))!;
  }

  beforeEach(() => {
    settled.value = true;
    editing.value = false;
    visible.value = [...everyCard];
    query.result.value = undefined;
    query.loading.value = false;
    query.error.value = undefined;
  });

  afterEach(() => {
    scopes.forEach((owner) => owner.stop());
    scopes = [];
  });

  // The backend takes the user from the token: the variables carry the store, currency, culture and the windows.
  it("sends the store, currency and culture with the period windows, and no user, customer or organization", () => {
    dashboard();

    const variables = query.variables!.value;
    expect(variables).toMatchObject({ storeId: "B2B-store", currencyCode: "USD", cultureName: "en-US" });
    expect(new Set(Object.keys(variables))).toEqual(
      new Set([
        "storeId",
        "currencyCode",
        "cultureName",
        "weekFrom",
        "weekTo",
        "prevWeekFrom",
        "prevWeekTo",
        "mtdFrom",
        "mtdTo",
        "prevFrom",
        "prevTo",
        "ytdFrom",
        "ytdTo",
        "lastYearFrom",
        "lastYearTo",
        "withWeek",
        "withMtd",
        "withMonthOverMonth",
        "withYtd",
        "withYearOverYear",
        "withAverageOrderValue",
      ]),
    );
  });

  // Fetching for the defaults first would ask for every card and then narrow.
  it("holds the query until the layout has been read, and the cards pending meanwhile", () => {
    settled.value = false;

    const { cards } = dashboard();

    expect(query.enabled!.value).toBe(false);
    expect(cards.value.every((card) => card.loading)).toBe(true);
  });

  it("asks only for the slices of the cards the user can see", () => {
    visible.value = ["orders_placed_mtd"];

    dashboard();

    expect(query.enabled!.value).toBe(true);
    expect(query.variables!.value).toMatchObject({
      withMtd: true,
      withMonthOverMonth: true,
      withWeek: false,
      withYtd: false,
    });
  });

  it("does not run the query with every card hidden", () => {
    visible.value = [];

    dashboard();

    expect(query.enabled!.value).toBe(false);
  });

  // The parked zone renders the hidden cards too, so editing asks for every card.
  it("asks for every card while the layout is edited", () => {
    visible.value = [];
    editing.value = true;

    dashboard();

    expect(query.enabled!.value).toBe(true);
    expect(query.variables!.value).toMatchObject({ withWeek: true, withYtd: true, withAverageOrderValue: true });
  });

  it("keeps every card in the set, in the table's order", () => {
    visible.value = ["avg_order_value"];

    expect(dashboard().cards.value.map((card) => card.key)).toEqual(everyCard);
  });

  it("marks every card the query feeds as failed when it fails", () => {
    query.error.value = new Error("network");

    expect(dashboard().cards.value.every((card) => card.failed)).toBe(true);
  });

  // A card whose slice arrived keeps its figure while the query refetches for a sibling.
  it("keeps a card's figures while the query is in flight for another card's slice", () => {
    query.loading.value = true;
    query.result.value = {
      orderStatistics: { currencyCode: "USD", week: STATISTICS.week, weekOverWeek: STATISTICS.weekOverWeek },
    };

    const cards = dashboard().cards.value;
    const byKey = (key: string) => cards.find((card) => card.key === key);

    expect(byKey("orders_placed_week")).toMatchObject({ loading: false, value: "3" });
    expect(byKey("orders_placed_ytd")?.loading).toBe(true);
  });
});
