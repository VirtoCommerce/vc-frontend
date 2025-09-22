import { defineAsyncComponent } from "vue";
import { useNavigations } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { useUser } from "@/shared/account/composables";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import { EXTENSION_NAMES } from "@/shared/common/constants/extensionPointsNames.ts";
import { loadModuleLocale } from "../utils";
import { MODULE_ID, ENABLED_KEY, LOYALTY_PAYMENT_TYPE_NAME } from "./constants";
import type { MenuType } from "@/core/types";
import type { I18n } from "@/i18n";
import type { DeepPartial } from "utility-types";
import type { Router, RouteRecordRaw } from "vue-router";

const PointsHistory = () => import("./pages/points-history.vue");
const PaymentProcessingLoyalty = defineAsyncComponent(() => import("./components/payment-processing-loyalty.vue"));

const { isEnabled } = useModuleSettings(MODULE_ID);
const { register } = useExtensionRegistry();

const { mergeMenuSchema } = useNavigations();

const route: RouteRecordRaw = {
  path: "points-history",
  name: "PointsHistory",
  component: PointsHistory,
};

const menuItems: DeepPartial<MenuType> = {
  header: {
    desktop: {
      account: {
        children: [
          {
            id: "points-history",
            route: { name: route.name },
            title: "loyalty.navigation.route_name",
            icon: "star",
            priority: 200,
          },
        ],
      },
    },
    mobile: {
      account: {
        children: [
          {
            id: "points-history",
            route: { name: route.name },
            title: "loyalty.navigation.route_name",
            icon: "star",
            priority: 200,
          },
        ],
      },
    },
  },
};

function renderCondition({ paymentTypeName }: { paymentTypeName: string }) {
  return paymentTypeName === LOYALTY_PAYMENT_TYPE_NAME;
}

export function init(router: Router, i18n: I18n) {
  const { isAuthenticated } = useUser();

  if (isAuthenticated.value && isEnabled(ENABLED_KEY)) {
    router.addRoute("Account", route);
    void loadModuleLocale(i18n, "loyalty");
    mergeMenuSchema(menuItems);

    register("paymentPage", EXTENSION_NAMES.paymentPage.paymentMethods, {
      component: PaymentProcessingLoyalty,
      condition: renderCondition,
    });
    register("orderPaymentPage", EXTENSION_NAMES.orderPaymentPage.paymentMethods, {
      component: PaymentProcessingLoyalty,
      condition: renderCondition,
    });
  }
}
