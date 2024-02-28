import { useLocalStorage, createGlobalState } from "@vueuse/core";
import { computed, ref } from "vue";
import { useFetch } from "@/core/api/common";
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

  const params = ref<URLSearchParams>();
  const {
    data,
    execute: getToken,
    isFetching: isAuthorizing,
  } = useFetch("/connect/token", {
    // Overwrite default interceptors
    beforeFetch: (context) => context,
    afterFetch: updateToken,
    onFetchError: (context) => context,
    immediate: false,
    updateDataOnError: true,
  })
    .post(params, "application/x-www-form-urlencoded")
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

  const { execute: revokeToken, isFetching: isUnauthorizing } = useFetch("/revoke/token", {
    immediate: false,
    beforeFetch: (context) => {
      if (headers.value.Authorization) {
        context.options.headers = { ...context.options.headers, ...headers.value };
      }
    },
  }).post();

  const INITIAL_STATE = Object.freeze({
    access_token: null,
    expires_at: null,
    refresh_token: null,
    token_type: "Bearer",
  });

  const state = useLocalStorage<{
    access_token: string | null;
    expires_at: Date | string | null;
    refresh_token: string | null;
    token_type: string;
  }>("auth", INITIAL_STATE);

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
    params.value = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: state.value.refresh_token!,
    });

    try {
      await getToken(true);
    } catch {
      state.value = INITIAL_STATE;
      broadcast.emit(unauthorizedErrorEvent, undefined, TabsType.CURRENT);
    }
  }

  async function unauthorize() {
    await revokeToken();
    state.value = INITIAL_STATE;
  }

  const expired = computed(() => {
    if (state.value.refresh_token === null || state.value.expires_at === null) {
      return null;
    }

    return new Date(state.value.expires_at).getTime() <= Date.now();
  });

  return {
    headers,
    expired,
    errors,
    isAuthorizing,
    authorize,
    refresh,
    isUnauthorizing,
    unauthorize,
  };
}

export const useAuth = createGlobalState(_useAuth);
