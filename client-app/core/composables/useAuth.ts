import { useLocalStorage } from "@vueuse/core";
import { computed, ref } from "vue";
import { useFetch } from "@/core/composables/useFetch";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { TabsType, unauthorizedErrorEvent, useBroadcast } from "@/shared/broadcast";

type IdentityErrorType = {
  code?: string;
  description?: string;
};

type IdentityResultType = {
  errors?: Array<IdentityErrorType>;
  succeeded: boolean;
};

type ConnectTokenResponseType = {
  expires_in?: number;
  access_token?: string;
  refresh_token?: string;
  errors?: Array<IdentityErrorType>;
  token_type?: string;
};

const { innerFetch } = useFetch();

export function useAuth() {
  const broadcast = useBroadcast();

  const accessToken = useLocalStorage("access_token", "");
  const accessTokenExpiredInMs = useLocalStorage("access_token_expired", "");
  const refreshToken = useLocalStorage("refresh_token", "");
  const tokenType = ref<string>("Bearer");

  const connectUrl = "/connect/token";
  const revokeUrl = "/revoke/token";

  async function authorize(username: string, password: string): Promise<IdentityResultType> {
    const { storeId } = globals;

    try {
      const { token_type, access_token, refresh_token, expires_in, errors } =
        await innerFetch<ConnectTokenResponseType>(
          connectUrl,
          "POST",
          new URLSearchParams({
            grant_type: "password",
            scope: "offline_access",
            storeId,
            username,
            password,
          }),
          "application/x-www-form-urlencoded",
        );

      if (errors?.length) {
        return {
          succeeded: false,
          errors,
        };
      }

      if (token_type && access_token && refresh_token && expires_in) {
        tokenType.value = token_type;

        setExpiredTime(expires_in);
        accessToken.value = access_token;
        refreshToken.value = refresh_token;
      }
      return {
        succeeded: true,
        errors: [],
      };
    } catch (e) {
      Logger.error(`${authorize.name}`, e);
      return {
        succeeded: false,
        errors: [],
      };
    }
  }

  async function refresh() {
    try {
      const { token_type, access_token, refresh_token, expires_in, errors } =
        await innerFetch<ConnectTokenResponseType>(
          connectUrl,
          "POST",
          new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: refreshToken.value,
          }),
          "application/x-www-form-urlencoded",
        );

      if (errors?.length) {
        clearState();
        broadcast.emit(unauthorizedErrorEvent, undefined, TabsType.CURRENT);
      }

      if (token_type && access_token && refresh_token && expires_in) {
        tokenType.value = token_type;
        setExpiredTime(expires_in);
        refreshToken.value = refresh_token;
        accessToken.value = access_token;
      }
    } catch (e) {
      Logger.error(`${refresh.name}`, e);
    }
  }

  function setExpiredTime(expires_in: number) {
    accessTokenExpiredInMs.value = String(Date.now() + expires_in * 1000);
  }

  function isTokenValid() {
    if (!accessToken.value) {
      return true;
    }
    return Date.now() < Number(accessTokenExpiredInMs.value);
  }

  const authHeaders = computed(() => {
    if (accessToken.value) {
      return {
        Authorization: `${tokenType.value} ${accessToken.value}`,
      } as Record<string, string>;
    }
    return {};
  });

  function clearState() {
    tokenType.value = "";
    accessToken.value = "";
    refreshToken.value = "";
    accessTokenExpiredInMs.value = "";
  }

  async function unauthorize() {
    try {
      await fetch(revokeUrl, {
        method: "POST",
        headers: authHeaders.value,
      });
      clearState();
    } catch (e) {
      Logger.error(`${unauthorize.name}`, e);
    }
  }

  return {
    authorize,
    unauthorize,
    refresh,
    isTokenValid,
    accessToken,
    refreshToken,
    authHeaders,
  };
}
