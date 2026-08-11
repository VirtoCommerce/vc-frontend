import { onError } from "@apollo/client/link/error";
import { errorHandler as serverErrorHandler } from "@/core/api/common";
import { ServerError } from "@/core/api/common/enums";
import { GraphQLErrorCode } from "@/core/api/graphql/enums";
import { hasErrorCode, toServerError } from "@/core/api/graphql/utils";
import { serializeError } from "@/core/utilities";
import { TabsType, userLockedEvent, passwordExpiredEvent, useBroadcast, graphqlErrorEvent } from "@/shared/broadcast";
import type { ErrorNotificationsContextType } from "@/core/api/graphql/consts";

export const errorHandlerLink = onError(({ operation, networkError, graphQLErrors }) => {
  const broadcast = useBroadcast();

  const serverError = toServerError(networkError, graphQLErrors);
  const userLockedError = hasErrorCode(graphQLErrors, GraphQLErrorCode.UserLocked);
  const passwordExpired = hasErrorCode(graphQLErrors, GraphQLErrorCode.PasswordExpired);
  // See SUPPRESS_ERROR_NOTIFICATIONS_CONTEXT: only the generic toasts are opt-out, the auth outcomes below are not.
  const { suppressErrorNotifications } = operation.getContext() as ErrorNotificationsContextType;

  if (serverError !== undefined) {
    if (serverError === ServerError.Unhandled && suppressErrorNotifications) {
      return;
    }

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
