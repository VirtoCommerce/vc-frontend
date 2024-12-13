import { createGlobalState } from "@vueuse/core";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAuth } from "@/core/composables/useAuth";
import { Logger } from "@/core/utilities";
import { TabsType, useBroadcast, reloadAndOpenMainPage } from "@/shared/broadcast";
import { useNotifications } from "@/shared/notification";

export function _useImpersonate() {
  const { impersonate, errors } = useAuth();
  const broadcast = useBroadcast();
  const status = ref();
  const notifications = useNotifications();
  const { t } = useI18n();

  async function _impersonate(userId: string) {
    status.value = "loading";

    try {
      await impersonate(userId);

      if (errors.value?.length) {
        status.value = "error";
      } else {
        status.value = "success";
        notifications.success({ text: t("pages.account.impersonate.success") });

        // reload all tabs to renew state
        setTimeout(() => {
          void broadcast.emit(reloadAndOpenMainPage, null, TabsType.ALL);
        }, 1000);
      }
    } catch (e) {
      Logger.error(impersonate.name, e);
      status.value = "error";
    }
  }

  return {
    impersonate: _impersonate,
    status,
  };
}

export const useImpersonate = createGlobalState(_useImpersonate);
