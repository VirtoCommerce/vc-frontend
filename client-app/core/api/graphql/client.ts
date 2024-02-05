import { InMemoryCache, ApolloClient, HttpLink } from "@apollo/client/core";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { useLocalStorage } from "@vueuse/core";
// todo check dependency cycle via useNavigations
import { useFetch } from "@/core/composables";
import {
  TabsType,
  forbiddenEvent,
  unauthorizedErrorEvent,
  unhandledErrorEvent,
  userLockedEvent,
  passwordExpiredEvent,
  useBroadcast,
} from "@/shared/broadcast";
import { GraphQLErrorCode } from "./enums";
import { hasErrorCode } from "./utils";
import type { FetchPolicy } from "@apollo/client/core";
const { innerFetch } = useFetch();

const accessToken = useLocalStorage("access_token", "");
const refreshToken = useLocalStorage("refresh_token", "");

const fetchPolicy: FetchPolicy = "no-cache";

const httpLink = new HttpLink({ uri: `/xapi/graphql` });

const broadcast = useBroadcast();

const errorHandler = onError(({ networkError, graphQLErrors }) => {
  const unauthorized = hasErrorCode(graphQLErrors, GraphQLErrorCode.Unauthorized);
  const forbidden = hasErrorCode(graphQLErrors, GraphQLErrorCode.Forbidden);
  const unhandledError = hasErrorCode(graphQLErrors, GraphQLErrorCode.Unhandled);
  const userLockedError = hasErrorCode(graphQLErrors, GraphQLErrorCode.UserLocked);
  const passwordExpired = hasErrorCode(graphQLErrors, GraphQLErrorCode.PasswordExpired);

  if (networkError || unhandledError) {
    broadcast.emit(unhandledErrorEvent, undefined, TabsType.ALL);
  }

  if (unauthorized) {
    broadcast.emit(unauthorizedErrorEvent, undefined, TabsType.ALL);
  }

  if (userLockedError) {
    broadcast.emit(userLockedEvent, undefined, TabsType.ALL);
  }

  if (forbidden) {
    broadcast.emit(forbiddenEvent, undefined, TabsType.CURRENT);
  }

  if (passwordExpired) {
    broadcast.emit(passwordExpiredEvent, undefined, TabsType.CURRENT);
  }
});

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
  const tokens = await innerFetch(
    "/connect/token",
    "POST",
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken.value,
    }),
    "application/x-www-form-urlencoded",
  );

  console.log(tokens);
}

// setTimeout(updateToken, 3000);

export const graphqlClient = new ApolloClient({
  // Provide required constructor fields
  link: errorHandler.concat(authTokenizer).concat(httpLink),
  cache: new InMemoryCache({
    addTypename: false,
  }),

  // Provide some optional constructor fields
  name: "x-api-graphql-client",
  connectToDevTools: true,
  assumeImmutableResults: true,
  queryDeduplication: false,

  defaultOptions: {
    watchQuery: { fetchPolicy },
    query: { fetchPolicy },
    mutate: { fetchPolicy },
  },
});
