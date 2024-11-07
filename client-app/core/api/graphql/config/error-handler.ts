import { onError } from "@apollo/client/link/error";
import { errorHandler } from "@/core/api/common";
import { GraphQLErrorCode } from "@/core/api/graphql/enums";
import { hasErrorCode, toServerError } from "@/core/api/graphql/utils";
import { TabsType, userLockedEvent, passwordExpiredEvent, useBroadcast } from "@/shared/broadcast";

export const errorHandlerLink = onError(({ networkError, graphQLErrors }) => {
  const broadcast = useBroadcast();

  errorHandler(toServerError(networkError, graphQLErrors));

  const userLockedError = hasErrorCode(graphQLErrors, GraphQLErrorCode.UserLocked);
  const passwordExpired = hasErrorCode(graphQLErrors, GraphQLErrorCode.PasswordExpired);

  if (userLockedError) {
    void broadcast.emit(userLockedEvent, undefined, TabsType.ALL);
  } else if (passwordExpired) {
    void broadcast.emit(passwordExpiredEvent, undefined, TabsType.CURRENT);
  } else if (graphQLErrors) {
    graphQLErrors.forEach((error) => {
      const path = error.path?.join("/");
      const locations = error.locations
        ?.map((location) => `Line: ${location.line}, Column: ${location.column}`)
        .join("/n");
      throw new Error(`[GraphQL error]: Message: ${error.message}, Path: ${path}, Location: ${locations}`);
    });
  }
});
