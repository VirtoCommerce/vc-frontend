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
  }

  if (passwordExpired) {
    void broadcast.emit(passwordExpiredEvent, undefined, TabsType.CURRENT);
  }

  if (graphQLErrors) {
    const errors = graphQLErrors.map((error) => `[GraphQL error]: Message: ${error.message}`);
    errors.forEach((error) => {
      throw new Error(error);
    });
  }
});
