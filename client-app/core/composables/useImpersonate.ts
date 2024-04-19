import { createGlobalState } from "@vueuse/core";
import { ref } from "vue";
import { useFetch } from "@/core/api/common";
import { useAuth } from "@/core/composables/useAuth";
import { Logger } from "@/core/utilities";
import { TabsType, pageReloadEvent, useBroadcast } from "@/shared/broadcast";

type ConnectTokenResponseType = {
  expires_in: number;
  access_token: string;
  token_type: string;
  error?: string;
};

export function _useImpersonate() {
  const { setTokenType, setAccessToken, setExpiresAt } = useAuth();
  const broadcast = useBroadcast();
  const status = ref();

  async function impersonate(userId: string) {
    status.value = "loading";

    try {
      const { error, data } = await useFetch("/connect/token")
        .post(
          new URLSearchParams({
            grant_type: "impersonate",
            user_id: userId,
          }),
          "application/x-www-form-urlencoded",
        )
        .json<ConnectTokenResponseType>();

      if (!data.value || error.value) {
        status.value = "error";
      } else {
        const { access_token, token_type, expires_in } = data.value;

        setAccessToken(access_token);
        setExpiresAt(expires_in);
        setTokenType(token_type);

        status.value = "success";

        broadcast.emit(pageReloadEvent, TabsType.OTHERS);
        setTimeout(() => {
          location.href = "/account";
        }, 2000);
      }
    } catch (e) {
      Logger.error(impersonate.name, e);
      status.value = "error";
    }
  }

  return {
    impersonate,
    status,
  };
}

export const useImpersonate = createGlobalState(_useImpersonate);
