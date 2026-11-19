import { HOW_IT_WORKS_ROUTE_NAME, SUBSCRIPTIONS_ROUTE_NAME } from "./constants";
import type { RouteRecordRaw } from "vue-router";

const Subscriptions = () => import("./pages/subscriptions.vue");
const HowItWorks = () => import("./pages/how-it-works.vue");

/** Account routes, added under the host's Account route. */
export const routes: RouteRecordRaw[] = [
  { path: "subscriptions", name: SUBSCRIPTIONS_ROUTE_NAME, component: Subscriptions },
  // A subscription had its own page before; links to it in sent emails and bookmarks open it on the list instead.
  {
    path: "subscriptions/:subscriptionId",
    redirect: (to) => ({ name: SUBSCRIPTIONS_ROUTE_NAME, query: { subscription: String(to.params.subscriptionId) } }),
  },
];

/** Top-level routes, open to guests: the Subscribe & Save rules linked from the product page. */
export const publicRoutes: RouteRecordRaw[] = [
  { path: "/how-subscriptions-work", name: HOW_IT_WORKS_ROUTE_NAME, component: HowItWorks, meta: { public: true } },
];
