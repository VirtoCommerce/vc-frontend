import { RouteRecordRaw } from "vue-router";
import { DEVELOPMENT } from "@/core/constants";
import { accountRoutes, corporateRoutes } from "@/router/routes";

// Error pages
import Error403 from "@/pages/403.vue";
import Error404 from "@/pages/404.vue";
import Error500 from "@/pages/500.vue";

const Home = () => import("@/pages/index.vue");
const SingInPage = () => import("@/pages/sign-in.vue");
const SignUpPage = () => import("@/pages/sign-up.vue");
const ForgotPassword = () => import("@/pages/forgot-password.vue");
const ResetPassword = () => import("@/pages/reset-password.vue");
const Account = () => import("@/pages/account/index.vue");
const Company = () => import("@/pages/company/index.vue");
const Search = () => import("@/pages/search.vue");
const BulkOrder = () => import("@/pages/bulk-order.vue");
const CompareProducts = () => import("@/pages/compare-products.vue");
const Checkout = () => import("@/pages/checkout.vue");
const Category = () => import("@/pages/category.vue");
const Product = () => import("@/pages/product.vue");
const Branch = () => import("@/pages/branch.vue");
const Matcher = () => import("@/ui-kit/components/pages/matcher.vue");

// Private development pages
const DemoLanding = () => import("@/pages/demo-landing.vue");
const DevUIKit = () => import("@/pages/ui-kit.vue");

export const mainRoutes: RouteRecordRaw[] = [
  { path: "/", name: "Home", component: Home },
  { path: "/403", name: "NoAccess", component: Error403 },
  { path: "/404", name: "NotFound", component: Error404 },
  { path: "/500", name: "InternalError", component: Error500 },
  { path: "/sign-in", name: "SignIn", component: SingInPage },
  { path: "/sign-up", name: "SignUp", component: SignUpPage },
  { path: "/confirm-invitation", name: "ConfirmInvitation", component: SignUpPage },
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
  {
    path: "/company",
    name: "Company",
    component: Company,
    children: corporateRoutes,
    meta: { requiresAuth: true },
    redirect: { name: corporateRoutes[0].name },
  },
  { path: "/demo-landing", name: "DemoLanding", component: DemoLanding },
  { path: "/branch/:branchId", name: "BranchPage", component: Branch, props: true },
  { path: "/search", name: "Search", component: Search },
  { path: "/bulk-order", name: "BulkOrder", component: BulkOrder },
  { path: "/compare", name: "CompareProducts", component: CompareProducts },
  { path: "/checkout", name: "Checkout", component: Checkout },
  { path: "/catalog", name: "Catalog", component: Category, props: true },
  { path: "/category/:categoryId", name: "Category", component: Category, props: true },
  { path: "/product/:productId", name: "Product", component: Product, props: true },
  { path: "/:pathMatch(.*)*", name: "Matcher", component: Matcher, props: true },
];

if (DEVELOPMENT) {
  mainRoutes.push({
    path: "/dev-ui-kit",
    name: "DevUIKit",
    component: DevUIKit,
  });
}
