import { RouteRecordRaw, RouterView } from "vue-router";

const Dashboard = () => import("@/pages/account/dashboard.vue");
const Profile = () => import("@/pages/account/profile.vue");
const Addresses = () => import("@/pages/account/addresses.vue");
const Orders = () => import("@/pages/account/orders.vue");
const OrderDetails = () => import("@/pages/account/order-details.vue");
const OrderPayment = () => import("@/pages/account/order-payment.vue");
const Lists = () => import("@/pages/account/lists.vue");
const ListDetails = () => import("@/pages/account/list-details.vue");
const CheckoutDefaults = () => import("@/pages/account/checkout-defaults.vue");

export const accountRoutes: RouteRecordRaw[] = [
  { path: "dashboard", name: "Dashboard", component: Dashboard },
  { path: "profile", name: "Profile", component: Profile },
  { path: "addresses", name: "Addresses", component: Addresses },
  {
    path: "orders",
    component: RouterView,
    children: [
      { path: "", name: "Orders", component: Orders },
      {
        path: ":orderId",
        component: RouterView,
        props: true,
        meta: { hideNavigation: true },
        children: [
          {
            path: "",
            name: "OrderDetails",
            component: OrderDetails,
          },
          {
            path: "payment",
            name: "OrderPayment",
            component: OrderPayment,
            meta: { layout: "Payment" },
          },
        ],
      },
    ],
  },
  {
    path: "lists",
    component: RouterView,
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
  { path: "checkout-defaults", name: "CheckoutDefaults", component: CheckoutDefaults },
];
