import { defineAsyncComponent } from "vue";
import {
  createQueueTarget,
  queuedMutationsController,
} from "@/core/api/graphql/config/links/queued-mutations/queued-mutations";
import { useNavigations } from "@/core/composables";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { MODULE_ID, ENABLED_KEY } from "@/modules/returns/constants";
import { menuItems } from "@/modules/returns/menu";
import { route } from "@/modules/returns/router";
import { loadModuleLocale } from "@/modules/utils";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import { EXTENSION_NAMES } from "@/shared/common/constants/extensionPointsNames";
import type { I18n } from "@/i18n";
import type { Router } from "vue-router";

const { isEnabled } = useModuleSettings(MODULE_ID);
const { mergeMenuSchema } = useNavigations();

export function init(router: Router, i18n: I18n) {
  if (isEnabled(ENABLED_KEY)) {
    router.addRoute("Account", route);
    mergeMenuSchema(menuItems);
    void loadModuleLocale(i18n, "returns");

    // The module puts its own button on the order page rather than the page importing it: the host
    // stays ignorant of returns, and the button and its query leave the order-details chunk.
    useExtensionRegistry().register("orderDetails", EXTENSION_NAMES.orderDetails.actions, {
      component: defineAsyncComponent(() => import("./components/request-return-button.vue")),
    });

    // A draft is saved whole on every edit, so the later payload should win outright and the
    // default merge is right. Claimed from here rather than declared in core: the link resolves
    // targets per request, and boot runs long before a draft can be opened.
    queuedMutationsController.registerTarget(
      createQueueTarget<{ command?: { returnId?: string } }>("UpdateReturn", {
        debounceMs: 800,
        getPartitionKey: (vars) => vars.command?.returnId ?? "",
      }),
      { owner: "returns" },
    );
  }
}
