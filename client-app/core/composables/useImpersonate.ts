import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useFetch } from "@/core/api/common";
import { useAuth } from "@/core/composables/useAuth";
import { Logger } from "@/core/utilities";
import { TabsType, useBroadcast, reloadAndOpenMainPage } from "@/shared/broadcast";
import { useNotifications } from "@/shared/notification";
import type { ConnectTokenResponseType } from "../types";

export function useImpersonate() {
  const { setTokenType, setAccessToken, setExpiresAt, setRefreshToken } = useAuth();
  const broadcast = useBroadcast();
  const status = ref();
  const notifications = useNotifications();
  const { t } = useI18n();

  async function impersonate(userId: string) {
    status.value = "loading";

    try {
      const { error, data } = await useFetch("/connect/token")
        .post(
          new URLSearchParams({
            grant_type: "impersonate",
            scope: "offline_access",
            user_id: userId,
          }),
          "application/x-www-form-urlencoded",
        )
        .json<ConnectTokenResponseType>();

      if (!data.value || error.value) {
        status.value = "error";
      } else {
        const { access_token, token_type, expires_in, refresh_token, error: tokenError, errors } = data.value;

        if (access_token && token_type && expires_in && refresh_token) {
          setAccessToken(access_token);
          setExpiresAt(expires_in);
          setTokenType(token_type);
          setRefreshToken(refresh_token);
          status.value = "success";
          notifications.success({ text: t("pages.account.impersonate.success") });

          // reload all tabs to renew state
          setTimeout(() => {
            void broadcast.emit(reloadAndOpenMainPage, null, TabsType.ALL);
          }, 1000);
        } else {
          notifications.error({ text: t("pages.account.impersonate.error") });
          Logger.error(impersonate.name, tokenError, errors);
          status.value = "error";
        }
      }
    } catch (e) {
      notifications.error({ text: t("pages.account.impersonate.error") });
      Logger.error(impersonate.name, e);
      status.value = "error";
    }
  }

  return {
    impersonate,
    status,
  };
}
