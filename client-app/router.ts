import { createRouter, createWebHistory } from "vue-router";

// Pages
const Home = () => import("./pages/home/home.vue");
const Product = () => import("./pages/product/product.vue");
const SingInPage = () => import("./pages/sign-in/sign-in-page.vue");
const SignUpPage = () => import("./pages/sign-up/sign-up-page.vue");
const Catalog = () => import("./pages/catalog/catalog.vue");
const Checkout = () => import("./pages/checkout/checkout.vue");
const Error403 = () => import("./pages/403/403.vue");
const Error404 = () => import("./pages/404/404.vue");
const Error500 = () => import("./pages/500/500.vue");
const CheckoutDefaults = () => import("./pages/account/checkout-defaults.vue");
const Dashboard = () => import("./pages/account/dashboard.vue");
const Addresses = () => import("./pages/account/addresses.vue");
const Account = () => import("./pages/account/account.vue");
const ForgotPassword = () => import("./pages/forgot-password/forgot-password.vue");
const ResetPassword = () => import("./pages/reset-password/reset-password.vue");
const Pages = () => import("./builder-preview/pages/pages.vue");

// Router definition
const router = createRouter({
  // History mode
  history: createWebHistory(),

  // Setup scroll behavior on route change
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return {
        top: 0,
        behavior: "smooth",
      };
    }
  },

  // Router map
  routes: [
    { path: "/", name: "Home", component: Home },
    { path: "/sign-in", name: "SignIn", component: SingInPage },
    { path: "/sign-up", name: "SignUp", component: SignUpPage },
    {
      path: "/account",
      component: Account,
      redirect: { name: "Dashboard" },
      meta: { requiresAuth: true },
      children: [
        { path: "dashboard", name: "Dashboard", component: Dashboard },
        { path: "addresses", name: "Addresses", component: Addresses },
        { path: "checkout-defaults", name: "CheckoutDefaults", component: CheckoutDefaults },
      ],
    },
    { path: "/forgot-password", name: "ForgotPassword", component: ForgotPassword },
    { path: "/reset-password", name: "ResetPassword", component: ResetPassword },
    { path: "/catalog", name: "CatalogRoot", component: Catalog },
    { path: "/catalog/:categoryKey", name: "Catalog", component: Catalog },
    { path: "/checkout", name: "Checkout", component: Checkout },
    { path: "/product/:id", name: "Product", component: Product },
    { path: "/500", name: "InternalError", component: Error500 },
    { path: "/403", name: "NoAccess", component: Error403 },
    { path: "/pages", name: "Pages", component: Pages },
    { path: "/:pathMatch(.*)*", name: "NotFound", component: Error404 },
  ],
});

export default router;
