import { computed, defineAsyncComponent } from "vue";
import { useNavigations } from "@/core/composables";
import { useLanguages } from "@/core/composables/useLanguages";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { MODULE_ID, ENABLED_KEY } from "@/modules/purchase-requests/constants";
import { menuItems } from "@/modules/purchase-requests/menu";
import { route } from "@/modules/purchase-requests/router";
import { useUser } from "@/shared/account/composables/useUser";
import { useBulkOrderExtensionPoints } from "@/shared/bulk-order/composables/useBulkOrderExtensionPoints";
import type { I18n } from "@/i18n";
import type { Router } from "vue-router";

const FromFile = defineAsyncComponent(() => import("@/modules/purchase-requests/components/from-file.vue"));

const { isEnabled } = useModuleSettings(MODULE_ID);
const { isAuthenticated } = useUser();
const { mergeMenuSchema } = useNavigations();
const { loadModuleLocale } = useLanguages();
const { registerAdditionalTab } = useBulkOrderExtensionPoints();

export function initialize(router: Router, i18n: I18n) {
  if (isEnabled(ENABLED_KEY)) {
    router.addRoute("Account", route);
    mergeMenuSchema(menuItems);
    void loadModuleLocale(i18n, "purchase-requests");
    registerAdditionalTab({
      id: "from-file",
      icon: "cloud-upload",
      label: computed(() => i18n.global.t("pages.bulk_order.from_file_tab")),
      hidden: computed(() => !isAuthenticated.value),
      element: FromFile,
    });
  }
}
