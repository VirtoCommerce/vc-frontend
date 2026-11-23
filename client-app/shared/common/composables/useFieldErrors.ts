import { useI18n } from "vue-i18n";
import { errorHandler, ServerError } from "@/core/api/common";
import { GraphQLErrorCode } from "@/core/api/graphql/enums";
import { getFieldValidationErrors, hasErrorCode, toServerError } from "@/core/api/graphql/utils";
import { DEFAULT_NOTIFICATION_DURATION } from "@/core/constants";
import { serializeError } from "@/core/utilities";
import { graphqlErrorEvent, TabsType, useBroadcast } from "@/shared/broadcast";
import type { FieldValidationErrorType } from "@/core/types";
import type { INotification } from "@/shared/notification";
import type { ApolloError } from "@apollo/client/core";
import type { GraphQLFormattedError } from "graphql";

const ADDRESSES_FIELD_PREFIX = "addresses[";

const FIELD_ERROR_MESSAGE_KEYS = new Map<string, string>([
  ["InvalidCharacters", "common.messages.invalid_characters"],
  ["HtmlTagsNotAllowed", "common.messages.html_tags_not_allowed"],
  ["UnsafeContent", "common.messages.unsafe_content"],
  ["InvalidEmail", "common.messages.email_is_not_correct"],
]);

export function useFieldErrors() {
  const { t } = useI18n();
  const broadcast = useBroadcast();

  function getFieldErrorMessage(errorCode?: string): string {
    return t(FIELD_ERROR_MESSAGE_KEYS.get(errorCode ?? "") ?? "common.messages.invalid_value");
  }

  function getErrorNotificationText(fieldErrors: FieldValidationErrorType[]): string {
    if (!fieldErrors.length) {
      return t("common.messages.something_went_wrong");
    }

    return fieldErrors.some((fieldError) => fieldError.field.startsWith(ADDRESSES_FIELD_PREFIX))
      ? t("common.messages.invalid_addresses")
      : t("common.messages.invalid_data");
  }

  /**
   * The generic error toast. For rejected input, its text says which kind of data was rejected.
   */
  function getErrorNotification(fieldErrors: FieldValidationErrorType[]): INotification {
    return {
      duration: DEFAULT_NOTIFICATION_DURATION,
      variant: "tonal",
      group: "GenericError",
      singleInGroup: true,
      text: getErrorNotificationText(fieldErrors),
    };
  }

  /**
   * Shows a rejected save. Returns the messages for the inputs the form has, keyed by input name (the error's
   * field path without `fieldPrefix`); every other error gets the global error toast, as on any other page.
   */
  function showSaveErrors(error: unknown, fieldNames: readonly string[], fieldPrefix = ""): Record<string, string> {
    const { networkError, graphQLErrors = [] } = (error ?? {}) as Partial<ApolloError>;
    const messages: Record<string, string> = {};
    const otherErrors: GraphQLFormattedError[] = [];

    for (const graphQLError of graphQLErrors) {
      const fieldError = getFieldValidationErrors([graphQLError]).at(0);
      const name = fieldError?.field.slice(fieldPrefix.length) ?? "";

      if (fieldError?.field.startsWith(fieldPrefix) && fieldNames.includes(name)) {
        messages[name] ??= getFieldErrorMessage(fieldError.errorCode);
      } else {
        otherErrors.push(graphQLError);
      }
    }

    // The toasts the error link shows when a request doesn't suppress them. It has already run the redirects
    // (sign-in, no access, locked user, expired password), which can't be suppressed.
    const serverError = toServerError(networkError, otherErrors);

    if (serverError === ServerError.Unhandled) {
      errorHandler(serverError, JSON.stringify(networkError ? serializeError(networkError) : otherErrors));
    } else if (
      !serverError &&
      otherErrors.length &&
      !hasErrorCode(otherErrors, GraphQLErrorCode.UserLocked) &&
      !hasErrorCode(otherErrors, GraphQLErrorCode.PasswordExpired)
    ) {
      void broadcast.emit(graphqlErrorEvent, otherErrors, TabsType.ALL);
    }

    return messages;
  }

  return {
    getErrorNotification,
    showSaveErrors,
  };
}
