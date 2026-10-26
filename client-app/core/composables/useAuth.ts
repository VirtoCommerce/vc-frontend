import { createGlobalState, useLocalStorage } from "@vueuse/core";
import { computed, ref } from "vue";
import { useFetch } from "@/core/api/common";
import { errorHandler, toServerError } from "@/core/api/common/utils";
import { IdentityErrors } from "@/core/enums";
import { globals } from "@/core/globals";
import { TabsType, unauthorizedErrorEvent, useBroadcast, userBeforeUnauthorizeEvent } from "@/shared/broadcast";
import type { ConnectTokenResponseType, TwoFactorChallengeType } from "../types";
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
        errorHandler(toServerError(context.error, context.response?.status), JSON.stringify(context.error));
      }
      return context;
    },
    immediate: false,
    updateDataOnError: true,
  })
    .post(getTokenParams, "application/x-www-form-urlencoded")
    .json<ConnectTokenResponseType>();

  const errors = computed(() => data.value?.errors);
  const lockoutSecondsRemaining = computed(() => data.value?.lockoutSecondsRemaining);
  const twoFactorChallenge = computed<TwoFactorChallengeType | undefined>(() => {
    const twoFactorToken = data.value?.twoFactorToken;
    const isTwoFactorRequired = errors.value?.some((error) => error.code === IdentityErrors.TWO_FACTOR_REQUIRED);

    return isTwoFactorRequired && twoFactorToken
      ? {
          twoFactorToken,
          provider: data.value?.provider,
          providers: data.value?.providers,
          resendSecondsRemaining: data.value?.resendSecondsRemaining,
        }
      : undefined;
  });

  function resetErrors() {
    data.value = null;
  }

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

  function setLastSelectedOrganization(params: URLSearchParams, userName: string): void {
    const organizationId = localStorage.getItem(`organization-id-${userName}`);

    if (organizationId) {
      params.set("organization_id", organizationId);
    }
  }

  async function requestToken(grantParams: Record<string, string>, userName: string): Promise<void> {
    const params = new URLSearchParams({ scope: "offline_access", ...grantParams });

    setLastSelectedOrganization(params, userName);

    getTokenParams.value = params;

    await (getTokenRequest = getToken(true));
  }

  async function authorize(username: string, password: string): Promise<void> {
    await requestToken({ grant_type: "password", storeId: globals.storeId, username, password }, username);
  }

  //  Signs in with a custom grant.  Existing state is replaced completely.
  async function authorizeWithGrant(params: URLSearchParams): Promise<ConnectTokenResponseType | null> {
    getTokenParams.value = params;

    await (getTokenRequest = getToken(true));

    const response = data.value;

    if (response?.access_token && response.token_type && response.expires_in) {
      state.value = {
        ...INITIAL_STATE,
        token_type: response.token_type,
        access_token: response.access_token,
        refresh_token: response.refresh_token ?? null,
        expires_at: new Date(Date.now() + response.expires_in * 1000),
      };
    }

    return response;
  }

  async function externalSignInCallback(): Promise<void> {
    getTokenParams.value = new URLSearchParams({
      grant_type: "external_sign_in",
      scope: "offline_access",
    });

    await (getTokenRequest = getToken(true));
  }

  async function otpSignIn({ email, code, storeId }: { email: string; code: string; storeId: string }): Promise<void> {
    await requestToken({ grant_type: "otp_email", storeId, email, code }, email);
  }

  async function mfaSignIn({
    email,
    twoFactorToken,
    code,
    storeId,
  }: {
    email: string;
    twoFactorToken: string;
    code: string;
    storeId: string;
  }): Promise<void> {
    await requestToken({ grant_type: "mfa", storeId, two_factor_token: twoFactorToken, code }, email);
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
    await revokeTokens();
  }

  async function revokeTokens() {
    await useFetch("/revoke/token").post();
    state.value = { ...INITIAL_STATE };
  }

  // Drops the stored tokens without revoking them, for tokens the server no longer accepts
  function resetTokens() {
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
    resetErrors,
    lockoutSecondsRemaining,
    twoFactorChallenge,
    isAuthorizing,
    authorize,
    authorizeWithGrant,
    externalSignInCallback,
    otpSignIn,
    mfaSignIn,
    refresh,
    unauthorize,
    revokeTokens,
    resetTokens,

    setTokenType,
    setAccessToken,
    setExpiresAt,
    setRefreshToken,
  };
}

export const useAuth = createGlobalState(_useAuth);
