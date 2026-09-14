import type { RouteRecordRaw } from "vue-router";

const Returns = () => import("@/modules/returns/pages/returns.vue");
const Return = () => import("@/modules/returns/pages/return.vue");
const SelectReturnItems = () => import("@/modules/returns/pages/select-return-items.vue");
const EditReturn = () => import("@/modules/returns/pages/edit-return.vue");

export const route: RouteRecordRaw = {
  path: "returns",
  children: [
    { path: "", name: "Returns", component: Returns },
    {
      path: "new/:orderId",
      name: "SelectReturnItems",
      component: SelectReturnItems,
      props: true,
      meta: { hideLeftSidebar: true },
    },
    {
      path: ":returnId/edit",
      name: "EditReturn",
      component: EditReturn,
      props: true,
      meta: { hideLeftSidebar: true },
    },
    {
      path: ":returnId",
      name: "Return",
      component: Return,
      props: true,
      meta: { hideLeftSidebar: true },
    },
  ],
};
