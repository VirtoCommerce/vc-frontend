import { useThemeContext } from "@/core/composables";
import { useUser } from "@/shared/account";
import { isActive as isPushMessagesActive } from "@/shared/push-messages/composables/usePushMessages";
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
const CheckoutDefaults = () => import("@/pages/account/checkout-defaults.vue");
const Quotes = () => import("@/pages/account/quotes.vue");
const EditQuote = () => import("@/pages/account/edit-quote.vue");
const ViewQuote = () => import("@/pages/account/view-quote.vue");
const SavedCreditCards = () => import("@/pages/account/saved-credit-cards.vue");
const Notifications = () => import("@/pages/account/notifications.vue");
const Impersonate = () => import("@/pages/account/impersonate.vue");

const { themeContext } = useThemeContext();

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
      if (themeContext.value.settings.quotes_enabled) {
        next();
      } else {
        next({ name: "Dashboard" });
      }
    },
  },
  {
    path: "saved-credit-cards",
    name: "SavedCreditCards",
    component: SavedCreditCards,
  },
  {
    path: "notifications",
    name: "Notifications",
    component: Notifications,
    beforeEnter(_to, _from, next) {
      if (isPushMessagesActive.value) {
        next();
      } else {
        next({ name: "Dashboard" });
      }
    },
  },
  {
    path: "impersonate/:userId",
    name: "Impersonate",
    props: true,
    component: Impersonate,
  },
];
