import { HttpLink, from } from "@apollo/client/core";
import { setContext } from "@apollo/client/link/context";
import { removeTypenameFromVariables } from "@apollo/client/link/remove-typename";
import { useLocalStorage } from "@vueuse/core";
import { cartLink } from "@/core/api/graphql/cart/links";
import { errorHandlerLink } from "@/core/api/graphql/config/error-handler";
import { API_URL } from "@/core/api/graphql/consts";
// todo check dependency cycle via useNavigations
import { useFetch } from "@/core/composables";

const { innerFetch } = useFetch();

const accessToken = useLocalStorage("access_token", "");
const refreshToken = useLocalStorage("refresh_token", "");

const authTokenizer = setContext(async (_, { headers }) => {
  const token = (await getAccessTokenPromise()) as string;
  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
});

function getAccessTokenPromise() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(accessToken.value);
    }, 3000);
  });
}

// eslint-disable-next-line
async function updateToken() {
  const { access_token, refresh_token }: { access_token: string; refresh_token: string } = await innerFetch(
    "/connect/token",
    "POST",
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken.value,
    }),
    "application/x-www-form-urlencoded",
  );

  if (!access_token || !refresh_token) {
    return;
  }

  refreshToken.value = refresh_token;
  accessToken.value = access_token;
}

// setTimeout(updateToken, 12000);

const httpLink = new HttpLink({ uri: API_URL });
const sharedLink = from([removeTypenameFromVariables(), errorHandlerLink]);

export const deprecatedLink = from([sharedLink, authTokenizer, httpLink]);

// https://www.apollographql.com/docs/react/api/link/introduction/#composing-a-link-chain
// Tree:
//         removeTypenameLink
//                  ↓
//          errorHandlerLink
//          ↓               ↓
// (conditional links) → httpLink
export const link = from([
  sharedLink,
  // Add conditional links here
  cartLink,
  httpLink,
]);
