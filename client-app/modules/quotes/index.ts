import { defineAsyncComponent } from "vue";
import { useNavigations, useThemeContext } from "@/core/composables";
import { useLanguages } from "@/core/composables/useLanguages";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { MODULE_ID, ENABLED_KEY } from "@/modules/quotes/constants";
import { useCartExtensionPoints } from "@/shared/cart/composables/useCartExtensionPoints";
import type { MenuType } from "@/core/types";
import type { I18n } from "@/i18n";
import type { DeepPartial } from "utility-types";
import type { Router, RouteRecordRaw } from "vue-router";

const Quotes = () => import("@/modules/quotes/pages/quotes.vue");
const EditQuote = () => import("@/modules/quotes/pages/edit-quote.vue");
const ViewQuote = () => import("@/modules/quotes/pages/view-quote.vue");
const CartWidget = defineAsyncComponent(() => import("@/modules/quotes/components/create-quote-from-cart.vue"));

const { isEnabled } = useModuleSettings(MODULE_ID);
const { mergeMenuSchema } = useNavigations();
const { registerSidebarWidget } = useCartExtensionPoints();
const { loadModuleLocale } = useLanguages();
const { themeContext } = useThemeContext();

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
};

const menuItems: DeepPartial<MenuType> = {
  header: {
    desktop: {
      account: {
        children: [
          {
            id: "quotes",
            route: { name: "Quotes" },
            title: "quotes.navigation.route_name",
            icon: "clipboard-arrow",
            priority: 90,
          },
        ],
      },
    },
    mobile: {
      account: {
        children: [
          {
            id: "quotes",
            route: { name: "Quotes" },
            title: "quotes.navigation.route_name",
            icon: "clipboard-arrow",
            priority: 90,
          },
        ],
      },
    },
  },
};

export function init(router: Router, i18n: I18n) {
  if (themeContext.value.settings.quotes_enabled && isEnabled(ENABLED_KEY)) {
    router.addRoute("Account", route);
    mergeMenuSchema(menuItems);
    void loadModuleLocale(i18n, "quotes");
    registerSidebarWidget({ id: "quotes", element: CartWidget });
  }
}
