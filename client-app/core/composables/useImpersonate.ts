import { createGlobalState } from "@vueuse/core";
import { useLocalStorage } from "@vueuse/core/index";
import { useFetch } from "@/core/api/common";
import { useAuth } from "@/core/composables/useAuth";
import { Logger } from "@/core/utilities";

type ConnectTokenResponseType = {
  expires_in: number;
  access_token: string;
  token_type: string;
  error?: string;
};

function _useImpersonate() {
  const { setTokenType, setAccessToken, setExpiresAt } = useAuth();

  const INITIAL_STATE = Object.freeze({
    userId: null,
    isImpersonated: false,
    isError: false,
  });

  const state = useLocalStorage<{
    userId: null | string;
    isImpersonated: boolean;
    isError: boolean;
  }>("impersonate", { ...INITIAL_STATE });

  async function impersonate(userId: string) {
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
        setImpersonateError();
      } else {
        const { access_token, token_type, expires_in } = data.value;
        clearImpersonateData();

        setAccessToken(access_token);
        setExpiresAt(expires_in);
        setTokenType(token_type);

        state.value.userId = userId;

        setImpersonateSuccess();

        location.href = "/account";
      }
    } catch (e) {
      Logger.error(impersonate.name, e);
      setImpersonateError();
    }
  }

  async function revokeImpersonate() {
    const { error, data } = await useFetch("/connect/token")
      .post(
        new URLSearchParams({
          grant_type: "impersonate",
          user_id: "",
        }),
        "application/x-www-form-urlencoded",
      )
      .json<ConnectTokenResponseType>();

    if (!data.value || error.value) {
      setImpersonateError();
    } else {
      const { access_token, token_type, expires_in } = data.value;
      if (access_token && token_type && expires_in) {
        setAccessToken(access_token);
        setExpiresAt(expires_in);
        setTokenType(token_type);

        clearImpersonateData();
        location.href = "/account";
      }
    }
  }

  async function checkImpersonate(userId: string) {
    if (state.value.userId !== userId || state.value.isError) {
      await impersonate(userId);
    }
  }

  function setImpersonateError() {
    state.value.isError = true;
  }

  function setImpersonateSuccess() {
    state.value.isError = false;
    state.value.isImpersonated = true;
  }

  function clearImpersonateData() {
    state.value = { ...INITIAL_STATE };
  }

  return {
    checkImpersonate,
    revokeImpersonate,
    impersonateState: state,
  };
}

export const useImpersonate = createGlobalState(_useImpersonate);
