import { onError } from "@apollo/client/link/error";
import { errorHandler as serverErrorHandler } from "@/core/api/common";
import { GraphQLErrorCode } from "@/core/api/graphql/enums";
import { hasErrorCode, toServerError } from "@/core/api/graphql/utils";
import { serializeError } from "@/core/utilities";
import { TabsType, userLockedEvent, passwordExpiredEvent, useBroadcast, graphqlErrorEvent } from "@/shared/broadcast";
import type { ErrorNotificationsContextType } from "@/core/api/graphql/consts";

export const errorHandlerLink = onError(({ operation, networkError, graphQLErrors }) => {
  const broadcast = useBroadcast();

  const userLockedError = hasErrorCode(graphQLErrors, GraphQLErrorCode.UserLocked);
  const passwordExpired = hasErrorCode(graphQLErrors, GraphQLErrorCode.PasswordExpired);
  // See SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT: only the generic toasts are opt-out, the auth outcomes below are not.
  const { suppressErrorNotifications } = operation.getContext() as ErrorNotificationsContextType;

  // `Unhandled` is the "no recognized code" bucket (`code === ""`) and `toServerError` resolves it first, so a
  // real auth code sharing the response would hide behind it. An opted-out operation therefore classifies what
  // is left once the generic errors are dropped: the toast goes, the sign-in redirect / no-access page stays.
  const serverError = suppressErrorNotifications
    ? toServerError(
        undefined,
        graphQLErrors?.filter(({ extensions }) => extensions?.code !== GraphQLErrorCode.Unhandled),
      )
    : toServerError(networkError, graphQLErrors);

  if (serverError !== undefined) {
    const errorData = networkError ? serializeError(networkError) : graphQLErrors;
    serverErrorHandler(serverError, JSON.stringify(errorData));
  } else if (userLockedError) {
    void broadcast.emit(userLockedEvent, undefined, TabsType.ALL);
  } else if (passwordExpired) {
    void broadcast.emit(passwordExpiredEvent, undefined, TabsType.CURRENT);
  } else if (graphQLErrors?.length && !suppressErrorNotifications) {
    graphQLErrors.forEach((error) => {
      void broadcast.emit(graphqlErrorEvent, error, TabsType.ALL);
    });
  }
});
