import { createGlobalState, useLocalStorage } from "@vueuse/core";
import { computed, ref } from "vue";
import { useFetch } from "@/core/api/common";
import { errorHandler, toServerError } from "@/core/api/common/utils";
import { globals } from "@/core/globals";
import { TabsType, unauthorizedErrorEvent, useBroadcast, userBeforeUnauthorizeEvent } from "@/shared/broadcast";
import type { ConnectTokenResponseType } from "../types";
import type { AfterFetchContext } from "@vueuse/core";

function _useAuth() {
  const broadcast = useBroadcast();

  const getTokenParams = ref<URLSearchParams>();

  let getTokenRequest: Promise<unknown> = Promise.resolve();
  const {
    data,
    execute: getToken,
    isFetching: isAuthorizing,
  } = useFetch("/connect/token", {
    afterFetch: updateToken,
    onFetchError: (context) => {
      if (context.response?.status !== 400) {
        errorHandler(toServerError(context.error, context.response?.status));
      }
      return context;
    },
    immediate: false,
    updateDataOnError: true,
  })
    .post(getTokenParams, "application/x-www-form-urlencoded")
    .json<ConnectTokenResponseType>();

  const errors = computed(() => data.value?.errors);

  const headers = computed(() => {
    if (state.value.access_token) {
      return {
        Authorization: `${state.value.token_type} ${state.value.access_token}`,
      };
    }
    return {};
  });

  const INITIAL_STATE = Object.freeze({
    expires_at: null,
    token_type: "Bearer",
    access_token: null,
    refresh_token: null,
  });

  const state = useLocalStorage<{
    expires_at: Date | string | null;
    token_type: string;
    access_token: string | null;
    refresh_token: string | null;
  }>("auth", { ...INITIAL_STATE });

  function updateToken(context: AfterFetchContext<ConnectTokenResponseType>) {
    if (context.data) {
      const { token_type, access_token, refresh_token, expires_in } = context.data;

      if (token_type && access_token && refresh_token && expires_in) {
        setTokenType(token_type);
        setExpiresAt(expires_in);
        setAccessToken(access_token);
        setRefreshToken(refresh_token);
      }
    }

    return context;
  }

  async function authorize(username: string, password: string): Promise<void> {
    const { storeId } = globals;

    const params = new URLSearchParams({
      grant_type: "password",
      scope: "offline_access",
      storeId,
      username,
      password,
    });

    const organizationId = localStorage.getItem(`organization-id-${username}`);

    if (organizationId) {
      params.set("organization_id", organizationId);
    }

    getTokenParams.value = params;

    await (getTokenRequest = getToken(true));
  }

  async function externalSignInCallback(): Promise<void> {
    getTokenParams.value = new URLSearchParams({
      grant_type: "external_sign_in",
      scope: "offline_access",
    });

    await (getTokenRequest = getToken(true));
  }

  async function refresh(organizationId?: string) {
    const params = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: state.value.refresh_token!,
    });

    if (organizationId) {
      params.set("organization_id", organizationId);
    }

    getTokenParams.value = params;

    try {
      if (!isAuthorizing.value) {
        await (getTokenRequest = getToken(true));
      } else {
        await getTokenRequest;
      }
    } catch {
      state.value = { ...INITIAL_STATE };
      void broadcast.emit(unauthorizedErrorEvent, undefined, TabsType.CURRENT);
    }
  }

  async function unauthorize() {
    await broadcast.emit(userBeforeUnauthorizeEvent, undefined, TabsType.CURRENT);
    await useFetch("/revoke/token").post();
    state.value = { ...INITIAL_STATE };
  }

  function isExpired() {
    if (state.value.refresh_token === null || state.value.expires_at === null) {
      return null;
    }

    return new Date(state.value.expires_at).getTime() <= Date.now();
  }

  function setRefreshToken(token: string) {
    state.value.refresh_token = token;
  }

  function setAccessToken(token: string) {
    state.value.access_token = token;
  }

  function setExpiresAt(seconds: number) {
    state.value.expires_at = new Date(Date.now() + seconds * 1000);
  }

  function setTokenType(type: string) {
    state.value.token_type = type;
  }

  return {
    headers,
    isExpired,
    errors,
    isAuthorizing,
    authorize,
    externalSignInCallback,
    refresh,
    unauthorize,

    setTokenType,
    setAccessToken,
    setExpiresAt,
    setRefreshToken,
  };
}

export const useAuth = createGlobalState(_useAuth);
