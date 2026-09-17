import { useNavigations } from "@/core/composables";
import { useUser } from "@/shared/account/composables";
import { loadModuleLocale } from "../utils";
import type { MenuType } from "@/core/types";
import type { I18n } from "@/i18n";
import type { DeepPartial } from "utility-types";
import type { Router, RouteRecordRaw } from "vue-router";

const Assistant = () => import("./pages/assistant.vue");

const { mergeMenuSchema } = useNavigations();

const route: RouteRecordRaw = {
  path: "assistant",
  name: "CommerceAgentAssistant",
  component: Assistant,
};

const menuItems: DeepPartial<MenuType> = {
  header: {
    desktop: {
      purchasing: {
        children: [
          {
            id: "commerce-agent",
            route: { name: "CommerceAgentAssistant" },
            title: "commerce_agent.navigation.route_name",
            icon: "chat",
            priority: 10,
          },
        ],
      },
    },
    mobile: {
      purchasing: {
        children: [
          {
            id: "commerce-agent",
            route: { name: "CommerceAgentAssistant" },
            title: "commerce_agent.navigation.route_name",
            icon: "chat",
            priority: 10,
          },
        ],
      },
    },
  },
};

/**
 * Enabled by pointing at the agent service rather than by a platform store setting: the agent
 * runs beside x-api and has no backend module to carry one yet.
 */
export function isCommerceAgentEnabled(): boolean {
  return !!import.meta.env.APP_AGENT_URL;
}

export function init(router: Router, i18n: I18n): void {
  if (!isCommerceAgentEnabled()) {
    return;
  }

  const { isAuthenticated } = useUser();

  router.addRoute("Account", route);
  void loadModuleLocale(i18n, "commerce-agent");

  if (isAuthenticated.value) {
    mergeMenuSchema(menuItems);
  }
}
