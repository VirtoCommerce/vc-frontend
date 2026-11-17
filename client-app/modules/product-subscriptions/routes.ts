import { HOW_IT_WORKS_ROUTE_NAME, SUBSCRIPTIONS_ROUTE_NAME } from "./constants";
import type { RouteRecordRaw } from "vue-router";

const Subscriptions = () => import("./pages/subscriptions.vue");
const HowItWorks = () => import("./pages/how-it-works.vue");

/** Account routes, added under the host's Account route. */
export const routes: RouteRecordRaw[] = [
  { path: "subscriptions", name: SUBSCRIPTIONS_ROUTE_NAME, component: Subscriptions },
];

/** Top-level routes, open to guests: the Subscribe & Save rules linked from the product page. */
export const publicRoutes: RouteRecordRaw[] = [
  { path: "/how-subscriptions-work", name: HOW_IT_WORKS_ROUTE_NAME, component: HowItWorks, meta: { public: true } },
];
