import { ROUTES } from "@/router/routes/constants";
import { useUser } from "@/shared/account";
import type { RouteRecordRaw } from "vue-router";

const Dashboard = () => import("@/pages/account/dashboard.vue");
const Profile = () => import("@/pages/account/profile.vue");
const ChangePassword = () => import("@/pages/account/change-password.vue");
const Addresses = () => import("@/pages/account/addresses.vue");
const Orders = () => import("@/pages/account/orders.vue");
const OrderDetails = () => import("@/pages/account/order-details.vue");
const OrderPayment = () => import("@/pages/account/order-payment.vue");
const Lists = () => import("@/pages/account/lists.vue");
const ListDetails = () => import("@/pages/account/list-details.vue");
const SavedForLaterDetails = () => import("@/pages/account/saved-for-later-details.vue");
const SavedCreditCards = () => import("@/pages/account/saved-credit-cards.vue");
const Impersonate = () => import("@/pages/account/impersonate.vue");
const PromotionCoupons = () => import("@/pages/account/promotion-coupons.vue");

export const accountRoutes: RouteRecordRaw[] = [
  { path: "dashboard", name: "Dashboard", component: Dashboard },
  { path: "change-password", name: "ChangePasswordAccount", component: ChangePassword },
  { path: "profile", name: "Profile", component: Profile },
  {
    path: "addresses",
    name: "Addresses",
    component: Addresses,
    beforeEnter(_to, _from, next) {
      const { isCorporateMember } = useUser();

      if (!isCorporateMember.value) {
        next();
      } else {
        next({ name: "Dashboard" });
      }
    },
  },
  {
    path: "orders",
    children: [
      { path: "", name: "Orders", component: Orders },
      {
        path: ":orderId",
        children: [
          {
            path: "",
            name: "OrderDetails",
            component: OrderDetails,
            props: true,
          },
          {
            path: "payment",
            name: "OrderPayment",
            component: OrderPayment,
            props: true,
            meta: { layout: "Secure" },
          },
        ],
        meta: { hideLeftSidebar: true },
      },
    ],
  },
  {
    path: "saved-for-later",
    children: [{ path: "", name: ROUTES.SAVED_FOR_LATER.NAME, component: SavedForLaterDetails }],
  },
  {
    path: "lists",
    children: [
      { path: "", name: "Lists", component: Lists },
      {
        path: ":listId",
        name: "ListDetails",
        component: ListDetails,
        props: true,
      },
    ],
  },
  {
    path: "saved-credit-cards",
    name: "SavedCreditCards",
    component: SavedCreditCards,
  },
  {
    path: "impersonate/:userId",
    name: "Impersonate",
    props: true,
    component: Impersonate,
  },
  {
    path: "coupons",
    name: "PromotionCoupons",
    component: PromotionCoupons,
  },
];
