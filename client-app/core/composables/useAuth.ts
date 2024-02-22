import { useLocalStorage } from "@vueuse/core";
import { jwtDecode } from "jwt-decode";
import { computed } from "vue";
import { useFetch } from "@/core/composables/useFetch";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { TabsType, unauthorizedErrorEvent, useBroadcast } from "@/shared/broadcast";
import type { IdentityResultType } from "@/core/api/graphql/types";

const { innerFetch } = useFetch();

type OAuthType = {
  access_token?: string;
  refresh_token?: string;
  error?: string;
  code?: string;
};

export function useAuth() {
  const broadcast = useBroadcast();

  const accessToken = useLocalStorage("access_token", "");
  const accessTokenExpiredInMs = useLocalStorage("access_token_expired", "");
  const refreshToken = useLocalStorage("refresh_token", "");

  const connectUrl = "/connect/token";
  const revokeUrl = "/revoke/token";

  async function authorize(username: string, password: string): Promise<IdentityResultType> {
    const { storeId } = globals;

    try {
      const { access_token, refresh_token, error, code } = await innerFetch<OAuthType>(
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

      if (error) {
        return {
          succeeded: false,
          errors: [{ code }],
        };
      }

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
      // todo emit unhandled error?
      Logger.error(`${authorize.name}`, e);
      return {
        succeeded: false,
        errors: [],
      };
    }
  }

  async function refresh() {
    try {
      const { access_token, refresh_token, error } = await innerFetch<OAuthType>(
        connectUrl,
        "POST",
        new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken.value,
        }),
        "application/x-www-form-urlencoded",
      );

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
    return Date.now() < Number(accessTokenExpiredInMs.value);
  }

  const authHeaders = computed(() => {
    if (accessToken.value) {
      return {
        Authorization: `Bearer ${accessToken.value}`,
      } as Record<string, string>;
    }
    return {};
  });

  function clearTokens() {
    accessToken.value = "";
    accessTokenExpiredInMs.value = "";
    refreshToken.value = "";
  }

  async function unauthorize() {
    try {
      await fetch(revokeUrl, {
        method: "POST",
        headers: authHeaders.value,
      });
      clearTokens();
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
