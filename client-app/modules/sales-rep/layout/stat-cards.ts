// KPI card data for the two surfaces, keyed by the id the layout registry uses (VCST-5367).
//
// Previously these lived inside `dashboard-widgets.vue` / `customer-profile-widgets.vue`, which both
// rendered a fixed array. The layout decides order and visibility now, so the cards are data the
// page looks up by id rather than a list a component owns.
//
// MOCK — visual only. Real figures arrive with the rep dashboard stats query and, for the customer
// profile, `salesRepCustomerOrderStatistics` (VCST-5309).
import type { SalesRepLayoutScopeType } from "../types/layout";
import type { StatWidgetCardType } from "../types/widgets";

const dashboardCards: StatWidgetCardType[] = [
  {
    key: "orders_on_hold",
    labelKey: "sales_rep.hub.dashboard.widgets.orders_on_hold",
    icon: "exclamation-circle",
    accent: "warning",
    value: "2",
    sub: "$4,860.00 total",
    delta: "1 from last week",
    deltaTone: "negative",
    deltaIcon: "chevron-down",
  },
  {
    key: "active_projects",
    labelKey: "sales_rep.hub.dashboard.widgets.active_projects",
    icon: "clipboard-list",
    accent: "success",
    value: "14",
    sub: "3 shared with you",
    delta: "2 new this week",
    deltaTone: "positive",
    deltaIcon: "chevron-up",
  },
  {
    key: "orders_placed_mtd",
    labelKey: "sales_rep.hub.dashboard.widgets.orders_placed_mtd",
    icon: "cash",
    accent: "info",
    value: "47",
    sub: "$142,510.00",
    delta: "+18% vs last month",
    deltaTone: "positive",
    deltaIcon: "chevron-up",
  },
  {
    key: "my_customers",
    labelKey: "sales_rep.hub.dashboard.widgets.my_customers",
    icon: "users",
    accent: "neutral",
    value: "68",
    sub: "12 ordered this month",
    delta: "3 new customers",
    deltaTone: "positive",
    deltaIcon: "chevron-up",
  },
];

const customerProfileCards: StatWidgetCardType[] = [
  {
    key: "ytd",
    labelKey: "sales_rep.customer_profile.widgets.ytd_purchases",
    icon: "chart-square-bar",
    accent: "success",
    value: "$72,165",
    sub: "vs $64,420 last year",
    delta: "12% YoY",
    deltaTone: "positive",
    deltaIcon: "chevron-up",
  },
  {
    key: "open_balance",
    labelKey: "sales_rep.customer_profile.widgets.open_balance",
    icon: "credit-card",
    accent: "warning",
    value: "$1,200",
    sub: "1 invoice past due",
    delta: "Follow up needed",
    deltaTone: "negative",
    deltaIcon: "chevron-down",
  },
  {
    key: "aov",
    labelKey: "sales_rep.customer_profile.widgets.avg_order_value",
    icon: "presentation-chart-bar",
    accent: "secondary",
    value: "$5,551",
    sub: "across 13 orders YTD",
    delta: "Lifetime $355,613",
    deltaTone: "positive",
    deltaIcon: "chevron-up",
  },
  {
    key: "orders_ytd",
    labelKey: "sales_rep.customer_profile.widgets.orders_ytd",
    icon: "lock-closed",
    accent: "primary",
    value: "13",
    sub: "last order Apr 21, 2026",
    delta: "Customer since 2014",
    deltaTone: "positive",
    deltaIcon: "chevron-up",
  },
];

const cardsByScope: Record<SalesRepLayoutScopeType, StatWidgetCardType[]> = {
  dashboard: dashboardCards,
  customerProfile: customerProfileCards,
};

// eslint-disable-next-line sonarjs/function-return-type -- card or undefined by design
export function getStatCard(scope: SalesRepLayoutScopeType, key: string): StatWidgetCardType | undefined {
  return cardsByScope[scope].find((card) => card.key === key);
}
