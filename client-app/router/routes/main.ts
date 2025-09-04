import { ROUTES } from "@/router/routes/constants";
import { accountRoutes } from "./account";
import { cartRoutes } from "./cart";
import { checkoutRoutes } from "./checkout";
import { corporateRoutes } from "./company";
import type { RouteRecordRaw } from "vue-router";
import Error403 from "@/pages/403.vue";
import Error404 from "@/pages/404.vue";
import Error500 from "@/pages/500.vue";

const callback = () => import("@/pages/auth/callback.vue");
const SingInPage = () => import("@/pages/sign-in.vue");
const SignUpPage = () => import("@/pages/sign-up.vue");
const ConfirmEmail = () => import("@/pages/confirm-email.vue");
const ConfirmInvitation = () => import("@/pages/confirm-invitation.vue");
const ForgotPassword = () => import("@/pages/forgot-password.vue");
const ResetPassword = () => import("@/pages/reset-password.vue");
const ChangePassword = () => import("@/pages/change-password.vue");
const BlockedPage = () => import("@/pages/blocked.vue");
const Account = () => import("@/pages/account/index.vue");
const Company = () => import("@/pages/company/index.vue");
const BulkOrder = () => import("@/pages/bulk-order.vue");
const CompareProducts = () => import("@/pages/compare-products.vue");
const Search = () => import("@/pages/search.vue");
const Catalog = () => import("@/pages/catalog.vue");
const Category = () => import("@/pages/category.vue");
const Product = () => import("@/pages/product.vue");
const SharedList = () => import("@/pages/shared-list.vue");
const Branch = () => import("@/pages/branch.vue");
const Welcome = () => import("@/pages/welcome.vue");
const Matcher = () => import("@/pages/matcher/matcher.vue");

export const mainRoutes: RouteRecordRaw[] = [
  { path: "/auth/callback", name: "AuthCallback", component: callback, meta: { public: true, redirectable: false } },
  { path: "/403", name: "NoAccess", component: Error403, meta: { public: true, redirectable: false } },
  { path: "/404", name: "NotFound", component: Error404, meta: { public: true, redirectable: false } },
  { path: "/500", name: "InternalError", component: Error500, meta: { public: false, redirectable: false } },
  { path: ROUTES.SIGN_IN.PATH, name: ROUTES.SIGN_IN.NAME, component: SingInPage, meta: { public: true } },
  { path: "/sign-up", name: "SignUp", component: SignUpPage, meta: { public: true } },
  { path: "/confirm-invitation", name: "ConfirmInvitation", component: ConfirmInvitation, meta: { public: true } },
  { path: "/forgot-password", name: "ForgotPassword", component: ForgotPassword, meta: { public: true } },
  { path: "/reset-password", name: "ResetPassword", component: ResetPassword, meta: { public: true } },
  { path: ROUTES.CHANGE_PASSWORD.PATH, name: ROUTES.CHANGE_PASSWORD.NAME, component: ChangePassword, meta: { public: false, redirectable: false } },
  { path: "/set-password", name: "SetPassword", component: ResetPassword, meta: { public: true } },
  { path: "/blocked", name: "Blocked", component: BlockedPage, meta: { public: true, redirectable: false } },
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
  { path: "/branch/:branchId", name: "BranchPage", component: Branch, props: true },
  { path: ROUTES.SEARCH.PATH, name: ROUTES.SEARCH.NAME, component: Search },
  { path: "/bulk-order", name: "BulkOrder", component: BulkOrder },
  { path: "/compare", name: "CompareProducts", component: CompareProducts },
  { path: "/successful-registration", name: "Welcome", component: Welcome, meta: { public: true } },
  ...cartRoutes,
  ...checkoutRoutes,
  { path: ROUTES.CATALOG.PATH, name: ROUTES.CATALOG.NAME, component: Catalog, props: true },
  { path: "/category/:categoryId", name: "Category", component: Category, props: true },
  {
    path: "/product/:productId",
    name: "Product",
    component: Product,
    props: (route) => ({ allowSetMeta: true, productId: route.params.productId }),
  },
  { path: "/shared-list/:sharingKey", name: "SharedList", component: SharedList, props: true },

  /** NOTE: Always leave it last. */
  { path: "/:pathMatch(.*)*", name: "Matcher", component: Matcher, props: true },
];
