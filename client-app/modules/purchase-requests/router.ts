import type { RouteRecordRaw } from "vue-router";

const PurchaseRequests = () => import("@/modules/purchase-requests/pages/purchase-requests.vue");
const PurchaseRequest = () => import("@/modules/purchase-requests/pages/purchase-request.vue");

export const route: RouteRecordRaw = {
  path: "purchase-requests",
  children: [
    { path: "", name: "PurchaseRequests", component: PurchaseRequests },
    {
      path: ":purchaseRequestId",
      name: "PurchaseRequest",
      component: PurchaseRequest,
      props: true,
      meta: { hideLeftSidebar: true },
    },
  ],
};
