import { onError } from "@apollo/client/link/error";
import { useAppInsights } from "vue3-application-insights";
import { errorHandler } from "@/core/api/common";
import { GraphQLErrorCode } from "@/core/api/graphql/enums";
import { hasErrorCode, toServerError } from "@/core/api/graphql/utils";
import { Logger } from "@/core/utilities";
import { TabsType, userLockedEvent, passwordExpiredEvent, useBroadcast, graphqlErrorEvent } from "@/shared/broadcast";

export const errorHandlerLink = onError(({ networkError, graphQLErrors, operation }) => {
  const broadcast = useBroadcast();
  const appInsights = useAppInsights();

  errorHandler(toServerError(networkError, graphQLErrors));

  if (networkError instanceof Error && networkError.name === "AbortError" && networkError.message.includes("timeout")) {
    const errorDetails = {
      name: "RequestTimeout",
      message: networkError.message,
      operation: operation.operationName,
      variables: operation.variables,
      timestamp: new Date().toISOString(),
    };

    Logger.error("Request timeout:", errorDetails);

    if (appInsights) {
      appInsights.trackException({
        error: networkError,
        properties: {
          operationName: operation.operationName,
          variables: JSON.stringify(operation.variables),
          type: "RequestTimeout",
        },
      });
    }
  }

  const userLockedError = hasErrorCode(graphQLErrors, GraphQLErrorCode.UserLocked);
  const passwordExpired = hasErrorCode(graphQLErrors, GraphQLErrorCode.PasswordExpired);

  if (userLockedError) {
    void broadcast.emit(userLockedEvent, undefined, TabsType.ALL);
  } else if (passwordExpired) {
    void broadcast.emit(passwordExpiredEvent, undefined, TabsType.CURRENT);
  } else if (graphQLErrors?.length) {
    graphQLErrors.forEach((error) => {
      void broadcast.emit(graphqlErrorEvent, error, TabsType.ALL);
    });
  }
});
