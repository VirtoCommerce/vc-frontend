import type { RouteRecordRaw } from "vue-router";

const Info = () => import("@/pages/company/info.vue");
const Members = () => import("@/pages/company/members.vue");

export const corporateRoutes: RouteRecordRaw[] = [
  { path: "info", name: "CompanyInfo", component: Info },
  { path: "members", name: "CompanyMembers", component: Members },
];
