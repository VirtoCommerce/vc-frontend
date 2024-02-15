import { onError } from "@apollo/client/link/error";
import { useLocalStorage } from "@vueuse/core/index";
import { GraphQLErrorCode } from "@/core/api/graphql/enums";
import {
  TabsType,
  forbiddenEvent,
  unauthorizedErrorEvent,
  unhandledErrorEvent,
  userLockedEvent,
  passwordExpiredEvent,
  useBroadcast,
} from "@/shared/broadcast";
import type { GraphQLError } from "graphql";

export function hasErrorCode(graphQLErrors: ReadonlyArray<GraphQLError> | undefined, errorCode: GraphQLErrorCode) {
  return graphQLErrors?.some((graphQLError) => graphQLError.extensions.code === errorCode);
}

export const errorHandlerLink = onError(({ networkError, graphQLErrors }) => {
  const broadcast = useBroadcast();

  const unauthorized = hasErrorCode(graphQLErrors, GraphQLErrorCode.Unauthorized);
  const forbidden = hasErrorCode(graphQLErrors, GraphQLErrorCode.Forbidden);
  const unhandledError = hasErrorCode(graphQLErrors, GraphQLErrorCode.Unhandled);
  const userLockedError = hasErrorCode(graphQLErrors, GraphQLErrorCode.UserLocked);
  const passwordExpired = hasErrorCode(graphQLErrors, GraphQLErrorCode.PasswordExpired);

  if (networkError || unhandledError) {
    broadcast.emit(unhandledErrorEvent, undefined, TabsType.ALL);
  }

  if (unauthorized) {
    const accessToken = useLocalStorage("access_token", "");
    const refreshToken = useLocalStorage("refresh_token", "");

    refreshToken.value = "";
    accessToken.value = "";

    broadcast.emit(unauthorizedErrorEvent, undefined, TabsType.ALL);
  }

  if (forbidden) {
    broadcast.emit(forbiddenEvent, undefined, TabsType.CURRENT);
  }

  if (userLockedError) {
    broadcast.emit(userLockedEvent, undefined, TabsType.ALL);
  }

  if (passwordExpired) {
    broadcast.emit(passwordExpiredEvent, undefined, TabsType.CURRENT);
  }
});
