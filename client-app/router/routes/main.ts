import { IS_DEVELOPMENT } from "@/core/constants";
import { accountRoutes } from "./account";
import { checkoutRoutes } from "./checkout";
import { corporateRoutes } from "./company";
import type { RouteRecordRaw } from "vue-router";
import Error403 from "@/pages/403.vue";
import Error404 from "@/pages/404.vue";
import Error500 from "@/pages/500.vue";

const Home = () => import("@/pages/index.vue");
const SingInPage = () => import("@/pages/sign-in.vue");
const SignUpPage = () => import("@/pages/sign-up.vue");
const ConfirmEmail = () => import("@/pages/confirm-email.vue");
const ConfirmInvitation = () => import("@/pages/confirm-invitation.vue");
const ForgotPassword = () => import("@/pages/forgot-password.vue");
const ResetPassword = () => import("@/pages/reset-password.vue");
const Account = () => import("@/pages/account/index.vue");
const Company = () => import("@/pages/company/index.vue");
const BulkOrder = () => import("@/pages/bulk-order.vue");
const CompareProducts = () => import("@/pages/compare-products.vue");
const Cart = () => import("@/pages/cart.vue");
const Checkout = () => import("@/pages/checkout/index.vue");
const Catalog = () => import("@/pages/catalog.vue");
const Product = () => import("@/pages/product.vue");
const Branch = () => import("@/pages/branch.vue");
const Matcher = () => import("@/ui-kit/components/pages/matcher.vue");

// Private development pages
const DemoLanding = () => import("@/pages/demo-landing.vue");
const DevUIKit = () => import("@/pages/ui-kit.vue");

export const mainRoutes: RouteRecordRaw[] = [
  { path: "/", name: "Home", component: Home, meta: { public: true } },
  { path: "/403", name: "NoAccess", component: Error403, meta: { public: true } },
  { path: "/404", name: "NotFound", component: Error404, meta: { public: true } },
  { path: "/500", name: "InternalError", component: Error500, meta: { public: true } },
  { path: "/sign-in", name: "SignIn", component: SingInPage, meta: { public: true } },
  { path: "/sign-up", name: "SignUp", component: SignUpPage, meta: { public: true } },
  { path: "/confirm-invitation", name: "ConfirmInvitation", component: ConfirmInvitation, meta: { public: true } },
  { path: "/forgot-password", name: "ForgotPassword", component: ForgotPassword, meta: { public: true } },
  { path: "/reset-password", name: "ResetPassword", component: ResetPassword, meta: { public: true } },
  { path: "/set-password", name: "SetPassword", component: ResetPassword, meta: { public: true } },
  { path: "/account/confirmemail", name: "ConfirmEmail", component: ConfirmEmail, meta: { public: true } },
  {
    path: "/account",
    name: "Account",
    component: Account,
    children: accountRoutes,
    redirect: { name: accountRoutes[0].name },
    meta: { requiresAuth: true },
  },
  {
    path: "/company",
    name: "Company",
    component: Company,
    children: corporateRoutes,
    redirect: { name: corporateRoutes[0].name },
    meta: {
      requiresAuth: true,
      requiresOrganization: true,
    },
  },
  { path: "/demo-landing", name: "DemoLanding", component: DemoLanding, meta: { public: true } },
  { path: "/branch/:branchId", name: "BranchPage", component: Branch, props: true },
  { path: "/search", name: "Search", component: Catalog },
  { path: "/bulk-order", name: "BulkOrder", component: BulkOrder },
  { path: "/compare", name: "CompareProducts", component: CompareProducts },
  { path: "/cart", name: "Cart", component: Cart },
  {
    path: "/checkout",
    name: "Checkout",
    component: Checkout,
    children: checkoutRoutes,
    redirect: { name: checkoutRoutes[0].name },
    meta: { layout: "Secure" },
    beforeEnter(_, from, next) {
      /**
       * NOTE: Allow proceeding to checkout only from cart.
       * Refreshing page will redirect to the cart. At any of the steps.
       */
      if (from.name === "Cart") {
        next();
      } else {
        next({ name: "Cart", replace: true });
      }
    },
  },
  { path: "/catalog", name: "Catalog", component: Catalog, props: true },
  { path: "/category/:categoryId", name: "Category", component: Catalog, props: true },
  { path: "/product/:productId", name: "Product", component: Product, props: true },

  /** NOTE: Always leave it last. */
  { path: "/:pathMatch(.*)*", name: "Matcher", component: Matcher, props: true },
];

if (IS_DEVELOPMENT || location.host.includes("dev-storefront.paas.govirto.")) {
  mainRoutes.push({
    path: "/ui-kit",
    name: "DevUIKit",
    component: DevUIKit,
    meta: { public: true },
  });
}
