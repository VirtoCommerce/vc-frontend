import { defineAsyncComponent } from "vue";
import { useThemeContext, useNavigations } from "@/core/composables";
import { useLanguages } from "@/core/composables/useLanguages";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { MODULE_ID, ENABLED_KEY } from "@/modules/quotes/constants";
import { useCustomHeaderLinkComponents } from "@/shared/layout/composables/useCustomHeaderLinkComponents";
import type { MenuType } from "@/core/types";
import type { I18n } from "@/i18n";
import type { ElementType } from "@/shared/layout/composables/useCustomHeaderLinkComponents";
import type { DeepPartial } from "utility-types";
import type { Router, RouteRecordRaw } from "vue-router";

const Quotes = () => import("@/modules/quotes/pages/quotes.vue");
const EditQuote = () => import("@/modules/quotes/pages/edit-quote.vue");
const ViewQuote = () => import("@/modules/quotes/pages/view-quote.vue");

const { themeContext } = useThemeContext();
const { isEnabled } = useModuleSettings(MODULE_ID);
const { mergeMenuSchema } = useNavigations();
const { loadModuleLocale } = useLanguages();
const { registerCustomLinkComponent } = useCustomHeaderLinkComponents();

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

const mobileMenuItem: DeepPartial<MenuType> = {
  header: {
    mobile: {
      account: {
        children: [
          {
            id: "quotes",
            route: { name: "Quotes" },
            title: "quotes.navigation.route_name",
            icon: "/static/images/dashboard/icons/quotes.svg#main",
          },
        ],
      },
    },
  },
};

const menuLinkCustomElement: ElementType = {
  id: "push-messages",
  component: defineAsyncComponent(() => import("@/shared/push-messages/components/link-push-messages.vue")),
};

export function init(router: Router, i18n: I18n) {
  if (isEnabled(ENABLED_KEY)) {
    router.addRoute("Account", route);
    mergeMenuSchema(mobileMenuItem);
    registerCustomLinkComponent(menuLinkCustomElement);
    void loadModuleLocale(i18n, "quotes");
  }
}
