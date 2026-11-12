import { omit } from "lodash-es";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useGetOrderStatisticsQuery } from "@/core/api/graphql/orders";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import {
  buildStatCards,
  buildStatisticsWindows,
  formatSignedPercent,
  formatStatCount,
  formatStatMoney,
  useStatDataNeeds,
} from "@/shared/dashboard";
import { ACCOUNT_DASHBOARD_CARDS } from "../dashboard-blocks";
import type { AccountStatNeedType } from "../dashboard-blocks";
import type { GetOrderStatisticsQuery } from "@/core/api/graphql/types";
import type { LayoutVisibilityType, StatCardDataType, StatCardType, StatNeedResultType } from "@/shared/dashboard";
import type { Composer } from "vue-i18n";

type OrderStatisticsType = NonNullable<GetOrderStatisticsQuery["orderStatistics"]>;

type AccountCardKeyType = (typeof ACCOUNT_DASHBOARD_CARDS)[number]["key"];

/** The query's `@include` flags: a slice no visible card needs is a bucket the backend never aggregates. */
export function orderStatisticsFlags(needs: ReadonlySet<AccountStatNeedType>) {
  return {
    withWeek: needs.has("week"),
    withMtd: needs.has("mtd"),
    withMonthOverMonth: needs.has("monthOverMonth"),
    withYtd: needs.has("ytd"),
    withYearOverYear: needs.has("yearOverYear"),
    withAverageOrderValue: needs.has("averageOrderValue"),
  };
}

/**
 * Whether the query has anything to fetch. Blind to `averageOrderValue`: it is a field inside `ytd`, so on its own it
 * would select nothing and the round trip would return only the currency code.
 */
export function needsOrderStatistics(needs: ReadonlySet<AccountStatNeedType>): boolean {
  return [...needs].some((need) => need !== "averageOrderValue");
}

/**
 * Where each need's slice comes from — the one `orderStatistics` query for all of them — and whether it arrived: the
 * mirror of `orderStatisticsFlags`. The engine's `statCardState` combines it with the query's state per card.
 */
export function statNeedResults(
  statistics: OrderStatisticsType | undefined,
): Record<AccountStatNeedType, StatNeedResultType<"orders">> {
  return {
    week: { query: "orders", arrived: Boolean(statistics?.week) },
    mtd: { query: "orders", arrived: Boolean(statistics?.mtd) },
    monthOverMonth: { query: "orders", arrived: Boolean(statistics?.monthOverMonth) },
    ytd: { query: "orders", arrived: Boolean(statistics?.ytd) },
    yearOverYear: { query: "orders", arrived: Boolean(statistics?.yearOverYear) },
    averageOrderValue: { query: "orders", arrived: Boolean(statistics?.ytd?.average) },
  };
}

/** The figures of every card from one `orderStatistics` result; an absent slice reads as zero. */
export function accountCardData(
  statistics: OrderStatisticsType | undefined,
  t: Composer["t"],
): Record<AccountCardKeyType, StatCardDataType> {
  // Orders in a currency the store cannot convert are left out of a period's figures; the card says how many,
  // rather than letting a total quietly cover less than it reads as.
  function withExcluded(text: string, excludedCount: number | undefined): string {
    if (!excludedCount) {
      return text;
    }

    const note = t(
      "shared.account.dashboard.excluded_orders",
      { count: formatStatCount(excludedCount) },
      excludedCount,
    );
    // One message rather than two joined here, so a language can reorder them or use its own separator.
    return t("shared.account.dashboard.sub_with_excluded", { sub: text, note });
  }

  // Order COUNT is what every card compares on. No delta at all when the previous period had none: the backend
  // sends no percent then, and a "+0%" or a dash would claim a comparison that does not exist.
  function delta(
    percent: number | null | undefined,
    textKey: string,
  ): Pick<StatCardDataType, "delta" | "deltaTone" | "deltaIcon"> {
    const signed = formatSignedPercent(percent);

    return {
      delta: signed ? t(textKey, { delta: signed.text }) : "",
      deltaTone: signed?.tone,
      deltaIcon: signed?.icon,
    };
  }

  // An "orders placed" card: the period's count and total, and the count against the previous period.
  function ordersPlaced(
    period: OrderStatisticsType["week"] | undefined,
    countChangePercent: number | null | undefined,
    vsKey: string,
  ): StatCardDataType {
    return {
      value: formatStatCount(period?.count),
      sub: withExcluded(formatStatMoney(period?.total), period?.excludedCount),
      ...delta(countChangePercent, vsKey),
    };
  }

  const ytd = statistics?.ytd;

  return {
    orders_placed_week: ordersPlaced(
      statistics?.week,
      statistics?.weekOverWeek?.countChangePercent,
      "shared.account.dashboard.vs_last_week",
    ),
    orders_placed_mtd: ordersPlaced(
      statistics?.mtd,
      statistics?.monthOverMonth?.countChangePercent,
      "shared.account.dashboard.vs_last_month",
    ),
    orders_placed_ytd: ordersPlaced(
      ytd,
      statistics?.yearOverYear?.countChangePercent,
      "shared.account.dashboard.vs_last_year",
    ),
    avg_order_value: {
      value: formatStatMoney(ytd?.average),
      sub: withExcluded(t("shared.account.dashboard.per_order"), ytd?.excludedCount),
    },
  };
}

/**
 * The account dashboard's KPI cards: the signed-in user's own orders, in one `orderStatistics` query shaped from the
 * page's layout — a hidden card costs nothing, and with every card hidden the query does not run.
 *
 * The card set never shrinks: the layout decides what renders, and a card missing while loading would blank its slot.
 */
export function useAccountDashboard(layout: LayoutVisibilityType) {
  const { t } = useI18n();
  const { needs, ready } = useStatDataNeeds(layout, ACCOUNT_DASHBOARD_CARDS);

  const variables = computed(() => ({
    storeId: globals.storeId,
    // The cards' own fallbacks format in this currency, so an empty period reads in the same one as a filled one.
    currencyCode: globals.currencyCode,
    cultureName: globals.cultureName,
    // The rolling 7-day window feeds the sales-rep hub's "New orders" card; this query declares no such variables.
    ...omit(buildStatisticsWindows(), ["recentFrom", "recentTo"]),
    ...orderStatisticsFlags(needs.value),
  }));

  const enabled = computed(() => ready.value && needsOrderStatistics(needs.value));

  const { result, loading, error, onError } = useGetOrderStatisticsQuery(variables, enabled);

  onError((queryError) => {
    // No toast: each card names the failure itself.
    Logger.error("[account dashboard] orderStatistics failed:", queryError);
  });

  const cards = computed<StatCardType[]>(() => {
    const statistics = result.value?.orderStatistics;

    // Waiting on the layout is still waiting: the cards must not read as zeros in the meantime.
    return buildStatCards(ACCOUNT_DASHBOARD_CARDS, accountCardData(statistics, t), {
      table: statNeedResults(statistics),
      states: { orders: { loading: !ready.value || loading.value, failed: Boolean(error.value) } },
    });
  });

  return { cards };
}
