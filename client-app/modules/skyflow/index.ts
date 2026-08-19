import { defineAsyncComponent } from "vue";
import { useModules, useNavigations } from "@/core/composables";
import { useUser } from "@/shared/account/composables";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import { EXTENSION_NAMES } from "@/shared/common/constants/extensionPointsNames.ts";
import { loadModuleLocale } from "../utils";
import { MODULE_ID_SKYFLOW, SKYFLOW_PAYMENT_TYPE_NAME } from "./constants";
import type { MenuType } from "@/core/types";
import type { I18n } from "@/i18n";
import type { DeepPartial } from "utility-types";
import type { Router, RouteRecordRaw } from "vue-router";

const SavedCreditCards = () => import("./pages/saved-credit-cards.vue");
const PaymentProcessingSkyflow = defineAsyncComponent(() => import("./components/payment-processing-skyflow.vue"));

const { hasModule } = useModules();
const { mergeMenuSchema } = useNavigations();
const { register } = useExtensionRegistry();

const route: RouteRecordRaw = {
  path: "saved-credit-cards",
  name: "SavedCreditCards",
  component: SavedCreditCards,
};

const menuItems: DeepPartial<MenuType> = {
  header: {
    desktop: {
      user: {
        children: [
          {
            id: "savedCreditCards",
            route: { name: "SavedCreditCards" },
            title: "skyflow.saved_credit_cards.menu_title",
            icon: "credit-card",
            priority: 40,
          },
        ],
      },
    },
    mobile: {
      user: {
        children: [
          {
            id: "savedCreditCards",
            route: { name: "SavedCreditCards" },
            title: "skyflow.saved_credit_cards.menu_title",
            icon: "credit-card",
            priority: 40,
          },
        ],
      },
    },
  },
};

function renderCondition({ paymentTypeName }: { paymentTypeName: string }) {
  return paymentTypeName === SKYFLOW_PAYMENT_TYPE_NAME;
}

export function init(router: Router, i18n: I18n): void {
  const { isAuthenticated } = useUser();
  const isSkyflowInstalled = hasModule(MODULE_ID_SKYFLOW);

  if (isSkyflowInstalled) {
    router.addRoute("Account", route);
    void loadModuleLocale(i18n, "skyflow");

    register("paymentPage", EXTENSION_NAMES.paymentPage.skyflowPaymentMethod, {
      component: PaymentProcessingSkyflow,
      condition: renderCondition,
    });
    register("orderPaymentPage", EXTENSION_NAMES.orderPaymentPage.skyflowPaymentMethod, {
      component: PaymentProcessingSkyflow,
      condition: renderCondition,
    });
  }

  if (isAuthenticated.value && isSkyflowInstalled) {
    mergeMenuSchema(menuItems);
  }
}
