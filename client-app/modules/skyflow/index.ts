import { defineAsyncComponent } from "vue";
import { useNavigations } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { useUser } from "@/shared/account/composables";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import { loadModuleLocale } from "../utils";
import { MODULE_ID_SKYFLOW, SKYFLOW_PAYMENT_EXTENSION, SKYFLOW_PAYMENT_TYPE_NAME } from "./constants";
import type { MenuType } from "@/core/types";
import type { I18n } from "@/i18n";
import type { DeepPartial } from "utility-types";
import type { Router, RouteRecordRaw } from "vue-router";

const SavedCreditCards = () => import("./pages/saved-credit-cards.vue");
const PaymentProcessingSkyflow = defineAsyncComponent(() => import("./components/payment-processing-skyflow.vue"));

const { hasModuleSettings } = useModuleSettings(MODULE_ID_SKYFLOW);
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
  const isSkyflowInstalled = hasModuleSettings.value;

  if (isSkyflowInstalled) {
    router.addRoute("Account", route);
    void loadModuleLocale(i18n, "skyflow");

    register("paymentPage", SKYFLOW_PAYMENT_EXTENSION, {
      component: PaymentProcessingSkyflow,
      condition: renderCondition,
    });
    register("orderPaymentPage", SKYFLOW_PAYMENT_EXTENSION, {
      component: PaymentProcessingSkyflow,
      condition: renderCondition,
    });
    register("cartPayment", SKYFLOW_PAYMENT_EXTENSION, {
      component: PaymentProcessingSkyflow,
      condition: renderCondition,
    });
  }

  if (isAuthenticated.value && isSkyflowInstalled) {
    mergeMenuSchema(menuItems);
  }
}
