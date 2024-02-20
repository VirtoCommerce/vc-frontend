import { useLocalStorage } from "@vueuse/core";
import { jwtDecode } from "jwt-decode";
import { computed } from "vue";
import { useFetch } from "@/core/composables/useFetch";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { TabsType, unauthorizedErrorEvent, useBroadcast } from "@/shared/broadcast";
import type { IdentityResultType } from "@/core/api/graphql/types";

const { innerFetch } = useFetch();

const FETCH_TIME_SHIFT = 30000;

type OAuthType = {
  access_token?: string;
  refresh_token?: string;
  error?: string;
};

export function useAuth() {
  const broadcast = useBroadcast();

  const accessToken = useLocalStorage("access_token", "");
  const accessTokenExpiredInMs = useLocalStorage("access_token_expired", "");
  const refreshToken = useLocalStorage("refresh_token", "");

  const url = "/connect/token";

  async function authorize(username: string, password: string): Promise<IdentityResultType> {
    const { storeId } = globals;

    try {
      const { access_token, refresh_token } = await innerFetch<OAuthType>(
        url,
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

      if (access_token && refresh_token) {
        accessTokenExpiredInMs.value = String((jwtDecode(access_token).exp as number) * 1000);

        accessToken.value = access_token;
        refreshToken.value = refresh_token;
      }
      return {
        succeeded: true,
        errors: [],
      };
    } catch (e) {
      Logger.error(`${authorize.name}`, e);
      // todo add errors
      return {
        succeeded: false,
        errors: [],
      };
    }
  }

  async function refresh() {
    try {
      const { access_token, refresh_token, error } = await innerFetch<OAuthType>(
        url,
        "POST",
        new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken.value,
        }),
        "application/x-www-form-urlencoded",
      );
      // actual error is invalid_grant
      if (error) {
        clearTokens();
        // other tab could be used by Anonymous
        broadcast.emit(unauthorizedErrorEvent, undefined, TabsType.CURRENT);
      }

      if (access_token && refresh_token) {
        accessTokenExpiredInMs.value = String((jwtDecode(access_token).exp as number) * 1000);

        refreshToken.value = refresh_token;
        accessToken.value = access_token;
      }
    } catch (e) {
      Logger.error(`${refresh.name}`, e);
    }
  }

  function isTokenValid() {
    if (!accessToken.value) {
      return true;
    }
    return Date.now() - FETCH_TIME_SHIFT < Number(accessTokenExpiredInMs.value);
  }

  const authHeaders = computed(() => {
    if (accessToken.value) {
      return {
        Authorization: `Bearer ${accessToken.value}`,
      };
    }
    return {};
  });

  function clearTokens() {
    accessToken.value = "";
    accessTokenExpiredInMs.value = "";
    refreshToken.value = "";
  }

  return {
    authorize,
    refresh,
    isTokenValid,
    accessToken,
    refreshToken,
    clearTokens,
    authHeaders,
  };
}
