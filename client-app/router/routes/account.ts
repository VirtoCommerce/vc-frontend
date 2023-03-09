import { RouteRecordRaw } from "vue-router";
import { useThemeContext } from "@/core/composables";

const Dashboard = () => import("@/pages/account/dashboard.vue");
const Profile = () => import("@/pages/account/profile.vue");
const Addresses = () => import("@/pages/account/addresses.vue");
const Orders = () => import("@/pages/account/orders.vue");
const OrderDetails = () => import("@/pages/account/order-details.vue");
const OrderPayment = () => import("@/pages/account/order-payment.vue");
const Lists = () => import("@/pages/account/lists.vue");
const ListDetails = () => import("@/pages/account/list-details.vue");
const CheckoutDefaults = () => import("@/pages/account/checkout-defaults.vue");
const Quotes = () => import("@/pages/account/quotes.vue");
const EditQuote = () => import("@/pages/account/edit-quote.vue");
const ViewQuote = () => import("@/pages/account/view-quote.vue");

export const accountRoutes: RouteRecordRaw[] = [
  { path: "dashboard", name: "Dashboard", component: Dashboard },
  { path: "profile", name: "Profile", component: Profile },
  { path: "addresses", name: "Addresses", component: Addresses },
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
  { path: "checkout-defaults", name: "CheckoutDefaults", component: CheckoutDefaults },
  {
    path: "quotes",
    children: [
      { path: "", name: "Quotes", component: Quotes },
      {
        path: ":quoteId",
        children: [
          {
            path: "",
            name: "ViewQuote",
            component: ViewQuote,
            props: true,
            meta: { hideLeftSidebar: true },
          },
          {
            path: "edit",
            name: "EditQuote",
            component: EditQuote,
            props: true,
          },
        ],
      },
    ],
    beforeEnter(_to, _from, next) {
      const { themeContext } = useThemeContext();

      if (themeContext.value.settings.quotes_enabled) {
        next();
      } else {
        next({ name: "Dashboard" });
      }
    },
  },
];
