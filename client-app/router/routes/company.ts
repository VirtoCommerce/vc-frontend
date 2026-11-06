import { XApiPermissions } from "@/core/enums";
import { useUser } from "@/shared/account";
import type { RouteRecordRaw } from "vue-router";

const Info = () => import("@/pages/company/info.vue");
const Members = () => import("@/pages/company/members.vue");
const Reporting = () => import("@/pages/company/company-reporting.vue");

export const corporateRoutes: RouteRecordRaw[] = [
  { path: "info", name: "CompanyInfo", component: Info },
  { path: "members", name: "CompanyMembers", component: Members },
  {
    path: "reporting",
    name: "CompanyReporting",
    component: Reporting,
    // The organization's figures are everyone's orders: only a member allowed to see all of them gets in. The server
    // refuses the statistics too; this keeps the page from opening on a refusal.
    beforeEnter(_to, _from, next) {
      const { checkPermissions } = useUser();

      if (checkPermissions(XApiPermissions.CanViewOrganizationOrders)) {
        next();
      } else {
        next({ name: "NoAccess" });
      }
    },
  },
];
