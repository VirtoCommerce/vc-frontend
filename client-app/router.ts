import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import SeoUrl from "@core/seo-routes.enum";
import {
  i18n,
  defaultLocale,
  supportedLocales,
  setI18nLocale,
  loadLocaleMessages,
  addLocaleAliasToRoutes,
} from "./i18n";

// Pages
const Home = () => import("./pages/home/home.vue");
const Product = () => import("./pages/product/product.vue");
const SingInPage = () => import("./pages/sign-in/sign-in-page.vue");
const SignUpPage = () => import("./pages/sign-up/sign-up-page.vue");
const Search = () => import("./pages/search/search.vue");
const Catalog = () => import("./pages/catalog/catalog.vue");
const BulkOrder = () => import("./pages/bulk-order/bulk-order.vue");
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
const OrderDetails = () => import("./pages/account/order-details.vue");
const Orders = () => import("./pages/account/orders.vue");
const Lists = () => import("./pages/account/lists.vue");
const ListDetails = () => import("./pages/account/list-details.vue");
const Profile = () => import("./pages/account/profile.vue");
const DemoLanding = () => import("./pages/demo-landing/demo-landing.vue");
const CompareProducts = () => import("./pages/compare-products/compare-products.vue");

const DevUIKit = () => import("./pages/_ui-kit/ui-kit.vue");

// Router map
const routes: RouteRecordRaw[] = [
  { path: "/", name: "Home", component: Home },
  { path: "/sign-in", name: "SignIn", component: SingInPage },
  { path: "/sign-up", name: "SignUp", component: SignUpPage },
  {
    path: "/account",
    name: "Account",
    component: Account,
    redirect: { name: "Dashboard" },
    meta: { requiresAuth: true },
    children: [
      { path: "dashboard", name: "Dashboard", component: Dashboard },
      { path: "addresses", name: "Addresses", component: Addresses },
      { path: "profile", name: "Profile", component: Profile },
      { path: "checkout-defaults", name: "CheckoutDefaults", component: CheckoutDefaults },
      { path: "orders", name: "Orders", component: Orders },
      { path: "order-details/:id", name: "OrderDetails", component: OrderDetails },
      { path: "lists", name: "Lists", component: Lists },
      { path: "lists/:listId", name: "ListDetails", component: ListDetails, props: true },
    ],
  },
  { path: "/forgot-password", name: "ForgotPassword", component: ForgotPassword },
  { path: "/reset-password", name: "ResetPassword", component: ResetPassword },
  { path: "/search", name: "Search", component: Search },
  { path: `/${SeoUrl.Catalog}/:categorySeoUrls*`, name: "Catalog", component: Catalog, props: true },
  { path: `/${SeoUrl.Product}/:productId`, name: "Product", component: Product, props: true },
  { path: "/bulk-order", name: "BulkOrder", component: BulkOrder },
  { path: "/checkout", name: "Checkout", component: Checkout },
  { path: "/demo-landing", name: "DemoLanding", component: DemoLanding },
  { path: "/compare", name: "CompareProducts", component: CompareProducts },
  { path: "/500", name: "InternalError", component: Error500 },
  { path: "/403", name: "NoAccess", component: Error403 },
  { path: "/:pathMatch(.*)*", name: "NotFound", component: Error404 },
];

if (import.meta.env.MODE === "development") {
  routes.push({
    path: "/dev-ui-kit",
    name: "DevUIKit",
    component: DevUIKit,
  });
}

// todo: move to plugin
export default function setupRouter() {
  addLocaleAliasToRoutes(routes);

  // Router definition
  const router = createRouter({
    routes,

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
  });

  router.beforeEach(async (to, from, next) => {
    let locale = to.path.split("/")[1];

    // use saved or default locale if path locale is not exists in available
    if (!supportedLocales.includes(locale)) {
      const savedLocale = localStorage.getItem("locale") as string;

      if (supportedLocales.includes(savedLocale)) {
        locale = savedLocale;
      } else {
        locale = defaultLocale;
      }

      if (locale !== defaultLocale) {
        const newPath = `/${locale}${to.path.charAt(0) != "/" ? "/" : ""}${to.path}`;
        return next({ path: newPath, query: to.query, hash: to.hash });
      }
    }

    // load locale messages if not yet
    if (i18n && !i18n.global.availableLocales.includes(locale)) {
      await loadLocaleMessages(locale);
    }

    // set i18n language
    setI18nLocale(locale);

    return next();
  });

  return router;
}
