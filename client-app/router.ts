import { createRouter as _createRouter, createWebHistory, RouteRecordRaw, RouterView } from "vue-router";

import Error403 from "@/pages/403/403.vue";
import Error404 from "@/pages/404/404.vue";
import Error500 from "@/pages/500/500.vue";

// Main pages
const Home = () => import("@/pages/home/home.vue");
const SingInPage = () => import("@/pages/sign-in/sign-in-page.vue");
const SignUpPage = () => import("@/pages/sign-up/sign-up-page.vue");
const ForgotPassword = () => import("@/pages/forgot-password/forgot-password.vue");
const ResetPassword = () => import("@/pages/reset-password/reset-password.vue");
const Account = () => import("@/pages/account/account.vue");
const Search = () => import("@/pages/search/search.vue");
const BulkOrder = () => import("@/pages/bulk-order/bulk-order.vue");
const CompareProducts = () => import("@/pages/compare-products/compare-products.vue");
const Checkout = () => import("@/pages/checkout/checkout.vue");
const Category = () => import("@/pages/category/category.vue");
const Product = () => import("@/pages/product/product.vue");
const Matcher = () => import("@/shared/catalog/components/matcher.vue");

// Account pages
const Dashboard = () => import("@/pages/account/dashboard.vue");
const Profile = () => import("@/pages/account/profile.vue");
const Addresses = () => import("@/pages/account/addresses.vue");
const Orders = () => import("@/pages/account/orders.vue");
const OrderDetails = () => import("@/pages/account/order-details.vue");
const Lists = () => import("@/pages/account/lists.vue");
const ListDetails = () => import("@/pages/account/list-details.vue");
const CheckoutDefaults = () => import("@/pages/account/checkout-defaults.vue");

// Private development pages
const BuilderDemoPages = () => import("./builder-preview/pages/pages.vue");
const DemoLanding = () => import("@/pages/demo-landing/demo-landing.vue");
const DevUIKit = () => import("@/pages/_ui-kit/ui-kit.vue");

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
        name: "OrderDetails",
        component: OrderDetails,
        meta: { hideNavigation: true },
        props: true,
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

export const mainRoutes: RouteRecordRaw[] = [
  { path: "/", name: "Home", component: Home },
  { path: "/403", name: "NoAccess", component: Error403 },
  { path: "/404", name: "NotFound", component: Error404 },
  { path: "/500", name: "InternalError", component: Error500 },
  { path: "/sign-in", name: "SignIn", component: SingInPage },
  { path: "/sign-up", name: "SignUp", component: SignUpPage },
  { path: "/forgot-password", name: "ForgotPassword", component: ForgotPassword },
  { path: "/reset-password", name: "ResetPassword", component: ResetPassword },
  {
    path: "/account",
    name: "Account",
    component: Account,
    children: accountRoutes,
    meta: { requiresAuth: true },
    redirect: { name: accountRoutes[0].name },
  },
  { path: "/demo-landing", name: "DemoLanding", component: DemoLanding },
  { path: "/demo-page", name: "BuilderDemoPages", component: BuilderDemoPages },
  { path: "/search", name: "Search", component: Search },
  { path: "/bulk-order", name: "BulkOrder", component: BulkOrder },
  { path: "/compare", name: "CompareProducts", component: CompareProducts },
  { path: "/checkout", name: "Checkout", component: Checkout },
  { path: "/catalog", name: "Catalog", component: Category, props: true },
  { path: "/category/:categoryId", name: "Category", component: Category, props: true },
  { path: "/product/:productId", name: "Product", component: Product, props: true },
  { path: "/:pathMatch(.*)*", name: "Matcher", component: Matcher, props: true },
];

if (import.meta.env.MODE === "development") {
  mainRoutes.push({
    path: "/dev-ui-kit",
    name: "DevUIKit",
    component: DevUIKit,
  });
}

export function getBaseUrl(supportedLocales: string[]): string {
  const localeInPath = location.pathname.split("/")[1];
  return supportedLocales.includes(localeInPath) ? `/${localeInPath}/` : "";
}

export function createRouter(options: { base: string }) {
  const { base } = options;

  return _createRouter({
    routes: mainRoutes,
    history: createWebHistory(base),
    scrollBehavior(to, from, savedPosition) {
      return savedPosition || { top: 0, behavior: "smooth" };
    },
  });
}
