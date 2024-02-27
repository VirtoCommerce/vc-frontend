import { useLocalStorage, createGlobalState } from "@vueuse/core";
import { computed, ref } from "vue";
import { useGlobalInterceptors, useFetch } from "@/core/api/common";
import { globals } from "@/core/globals";
import { TabsType, unauthorizedErrorEvent, useBroadcast } from "@/shared/broadcast";
import type { AfterFetchContext } from "@vueuse/core";

type IdentityErrorType = {
  code?: string;
  description?: string;
};

type ConnectTokenResponseType = {
  expires_in?: number;
  access_token?: string;
  refresh_token?: string;
  errors?: Array<IdentityErrorType>;
  error: string;
  token_type?: string;
};

function _useAuth() {
  const broadcast = useBroadcast();
  const { onRequest } = useGlobalInterceptors();

  const connectUrl = "/connect/token";

  const params = ref<URLSearchParams>();
  const {
    data,
    execute: getToken,
    isFetching: isAuthorizing,
  } = useFetch(connectUrl, {
    afterFetch: updateToken,
    immediate: false,
    onFetchError: (context) => {
      context.response = null;
      return context;
    },
    updateDataOnError: true,
  })
    .post(params, "application/x-www-form-urlencoded")
    .json<ConnectTokenResponseType>();

  const errors = computed(() => data.value?.errors);

  const { execute: revokeToken, isFetching: isUnauthorizing } = useFetch("/revoke/token", { immediate: false }).post();

  const state = useLocalStorage<{
    access_token: string | null;
    expires_at: Date | string | null;
    refresh_token: string | null;
    token_type: string;
  }>("auth", {
    access_token: null,
    expires_at: null,
    refresh_token: null,
    token_type: "Bearer",
  });

  onRequest.value.push(async (_, request) => {
    if (isTokenExpired()) {
      await refresh();
    }

    if (request) {
      request.headers = { ...request.headers, ...authHeaders.value };
    }
  });

  function updateToken(context: AfterFetchContext<ConnectTokenResponseType>) {
    if (context.data) {
      const { token_type, access_token, refresh_token, expires_in } = context.data ?? {};

      if (token_type && access_token && refresh_token && expires_in) {
        state.value.token_type = token_type;
        state.value.expires_at = new Date(Date.now() + expires_in * 1000);
        state.value.access_token = access_token;
        state.value.refresh_token = refresh_token;
      }
    }

    return context;
  }

  async function authorize(username: string, password: string): Promise<void> {
    const { storeId } = globals;

    params.value = new URLSearchParams({
      grant_type: "password",
      scope: "offline_access",
      storeId,
      username,
      password,
    });

    await getToken(true);
  }

  async function refresh() {
    // ???
    if (state.value.refresh_token) {
      params.value = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: state.value.refresh_token!,
      });
    }

    await getToken();

    // ???
    if (data.value?.error) {
      state.value = null;
      broadcast.emit(unauthorizedErrorEvent, undefined, TabsType.CURRENT);
    }
  }

  function isTokenExpired() {
    if (state.value.expires_at === null) {
      return null;
    }

    return new Date(state.value.expires_at).getTime() <= Date.now();
  }

  const authHeaders = computed(() => {
    if (state.value.access_token) {
      return {
        Authorization: `${state.value.token_type} ${state.value.access_token}`,
      };
    }
    return {};
  });

  async function unauthorize() {
    await revokeToken(true);
    state.value = null;
  }

  return {
    connectUrl,
    errors,
    isAuthorizing,
    authorize,
    isUnauthorizing,
    unauthorize,
  };
}

export const useAuth = createGlobalState(_useAuth);
