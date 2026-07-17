import { ROUTE_NAME, ROUTE_SEGMENT } from "./constants";
import type { RouteRecordRaw } from "vue-router";

const SalesRepsPage = () => import("./pages/sales-reps.vue");

// Relative path -> mounts under the "Company" parent (/company/sales-reps).
export const salesRepsRoute: RouteRecordRaw = {
  path: ROUTE_SEGMENT,
  name: ROUTE_NAME,
  component: SalesRepsPage,
};
