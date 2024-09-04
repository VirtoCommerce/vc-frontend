import { useThemeContext, useNavigations } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { MODULE_ID, ENABLED_KEY } from "@/modules/quotes/constants";
import type { MenuType } from "@/core/types";
import type { Router, RouteRecordRaw } from "vue-router";

const Quotes = () => import("@/modules/quotes/pages/quotes.vue");
const EditQuote = () => import("@/modules/quotes/pages/edit-quote.vue");
const ViewQuote = () => import("@/modules/quotes/pages/view-quote.vue");

const { themeContext } = useThemeContext();
const { isEnabled } = useModuleSettings(MODULE_ID);
const { mergeSchema } = useNavigations();

const route: RouteRecordRaw = {
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
};

const menuItem: MenuType = {
  footer: [],
  header: {
    desktop: [],
    mobile: {
      main: [],
      corporate: {
        id: "",
        route: { name: "" },
        title: "",
        icon: "",
        children: [],
      },
      account: {
        id: "",
        route: { name: "" },
        title: "",
        icon: "",
        children: [
          {
            id: "quotes",
            route: { name: "Quotes" },
            title: "shared.layout.header.mobile.account_menu.quote_requests",
            icon: "/static/images/dashboard/icons/quotes.svg#main",
          },
        ],
      },
    },
  },
};

export function init(router: Router): void {
  if (isEnabled(ENABLED_KEY)) {
    router.addRoute("Account", route);
    mergeSchema(menuItem);
  }
}
