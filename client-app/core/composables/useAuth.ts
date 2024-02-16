import { useLocalStorage } from "@vueuse/core";
import { useFetch } from "@/core/composables/useFetch";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
const { innerFetch } = useFetch();

type OAuthType = {
  access_token: string;
  refresh_token: string;
};

export function useAuth() {
  const accessToken = useLocalStorage("access_token", "");
  const refreshToken = useLocalStorage("refresh_token", "");

  async function authorize(username: string, password: string) {
    const { storeId } = globals;

    try {
      const { access_token, refresh_token } = await innerFetch<OAuthType>(
        "/connect/token",
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

      accessToken.value = access_token;
      refreshToken.value = refresh_token;
    } catch (e) {
      Logger.error(`${authorize.name}`, e);
    }
  }

  return {
    authorize,
  };
}
