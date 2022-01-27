import { createRouter, createWebHistory } from "vue-router";
import Home from "./pages/home/home.vue";
import Product from "./pages/product/product.vue";
import SingInPage from "./pages/sign-in/sign-in-page.vue";
import SignUpPage from "./pages/sign-up/sign-up-page.vue";
import Catalog from "./pages/catalog/catalog.vue";
import Checkout from "./pages/checkout/checkout.vue";
import Error403 from "./pages/403/403.vue";
import Error404 from "./pages/404/404.vue";
import Error500 from "./pages/500/500.vue";
import CheckoutDefaults from "./pages/account/checkout-defaults.vue";
import Dashboard from "./pages/account/dashboard.vue";
import Addresses from "./pages/account/addresses.vue";
import Account from "./pages/account/account.vue";
import ForgotPassword from "./pages/forgot-password/forgot-password.vue";
import ResetPassword from "./pages/reset-password/reset-password.vue";

const router = createRouter({
  history: createWebHistory(),
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
  routes: [
    { path: "/", name: "Home", component: Home },
    { path: "/sign-in", name: "SignIn", component: SingInPage },
    { path: "/sign-up", name: "SignUp", component: SignUpPage },
    {
      path: "/account",
      component: Account,
      redirect: { name: "Dashboard" },
      children: [
        { path: "dashboard", name: "Dashboard", component: Dashboard },
        { path: "addresses", name: "Adresses", component: Addresses },
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
    { path: "/:pathMatch(.*)*", name: "NotFound", component: Error404 },
  ],
});

export default router;
