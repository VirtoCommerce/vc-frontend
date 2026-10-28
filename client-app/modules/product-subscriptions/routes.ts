import { SUBSCRIPTION_DETAILS_ROUTE_NAME, SUBSCRIPTIONS_ROUTE_NAME } from "./constants";
import type { RouteRecordRaw } from "vue-router";

const Subscriptions = () => import("./pages/subscriptions.vue");
const SubscriptionDetails = () => import("./pages/subscription-details.vue");

/** Account routes, added under the host's Account route. */
export const routes: RouteRecordRaw[] = [
  {
    path: "subscriptions",
    children: [
      { path: "", name: SUBSCRIPTIONS_ROUTE_NAME, component: Subscriptions },
      { path: ":subscriptionId", name: SUBSCRIPTION_DETAILS_ROUTE_NAME, component: SubscriptionDetails, props: true },
    ],
  },
];
