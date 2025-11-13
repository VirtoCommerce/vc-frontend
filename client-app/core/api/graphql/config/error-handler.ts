import { onError } from "@apollo/client/link/error";
import { errorHandler as serverErrorHandler } from "@/core/api/common";
import { GraphQLErrorCode } from "@/core/api/graphql/enums";
import { hasErrorCode, toServerError } from "@/core/api/graphql/utils";
import { serializeError } from "@/core/utilities";
import { TabsType, userLockedEvent, passwordExpiredEvent, useBroadcast, graphqlErrorEvent } from "@/shared/broadcast";

export const errorHandlerLink = onError(({ networkError, graphQLErrors }) => {
  const broadcast = useBroadcast();

  const serverError = toServerError(networkError, graphQLErrors);
  const userLockedError = hasErrorCode(graphQLErrors, GraphQLErrorCode.UserLocked);
  const passwordExpired = hasErrorCode(graphQLErrors, GraphQLErrorCode.PasswordExpired);

  if (serverError !== undefined) {
    const errorData = networkError ? serializeError(networkError as Error) : graphQLErrors;
    serverErrorHandler(serverError, JSON.stringify(errorData));
  } else if (userLockedError) {
    void broadcast.emit(userLockedEvent, undefined, TabsType.ALL);
  } else if (passwordExpired) {
    void broadcast.emit(passwordExpiredEvent, undefined, TabsType.CURRENT);
  } else if (graphQLErrors?.length) {
    graphQLErrors.forEach((error) => {
      void broadcast.emit(graphqlErrorEvent, error, TabsType.ALL);
    });
  }
});
