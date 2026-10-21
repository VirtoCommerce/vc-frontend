import { useI18n } from "vue-i18n";
import { getFieldValidationErrors } from "@/core/api/graphql/utils";
import { DEFAULT_NOTIFICATION_DURATION } from "@/core/constants";
import { useNotifications } from "@/shared/notification";
import type { FieldValidationErrorType } from "@/core/types";
import type { ApolloError } from "@apollo/client/core";

const ADDRESSES_FIELD_PREFIX = "addresses[";

const FIELD_ERROR_MESSAGE_KEYS = new Map<string, string>([
  ["InvalidCharacters", "common.messages.invalid_characters"],
  ["HtmlTagsNotAllowed", "common.messages.html_tags_not_allowed"],
  ["UnsafeContent", "common.messages.unsafe_content"],
]);

export function useFieldErrors() {
  const { t } = useI18n();
  const notifications = useNotifications();

  function getFieldErrorMessage(errorCode?: string): string {
    return t(FIELD_ERROR_MESSAGE_KEYS.get(errorCode ?? "") ?? "common.messages.invalid_value");
  }

  /**
   * Text of an error toast: for rejected input, which kind of data was rejected; for anything else, the generic
   * message.
   */
  function getErrorNotificationText(fieldErrors: FieldValidationErrorType[]): string {
    if (!fieldErrors.length) {
      return t("common.messages.something_went_wrong");
    }

    return fieldErrors.some((fieldError) => fieldError.field.startsWith(ADDRESSES_FIELD_PREFIX))
      ? t("common.messages.invalid_addresses")
      : t("common.messages.invalid_data");
  }

  /**
   * Shows a rejected save. Returns the messages for the inputs the form has, keyed by input name (the error's
   * field path without `fieldPrefix`); everything else goes into one error toast.
   */
  function showSaveErrors(error: unknown, fieldNames: readonly string[], fieldPrefix = ""): Record<string, string> {
    const fieldErrors = getFieldValidationErrors((error as ApolloError | undefined)?.graphQLErrors);
    const messages: Record<string, string> = {};
    const otherFieldErrors: FieldValidationErrorType[] = [];

    for (const fieldError of fieldErrors) {
      const name = fieldError.field.startsWith(fieldPrefix) ? fieldError.field.slice(fieldPrefix.length) : "";

      if (fieldNames.includes(name)) {
        messages[name] ??= getFieldErrorMessage(fieldError.errorCode);
      } else {
        otherFieldErrors.push(fieldError);
      }
    }

    if (!fieldErrors.length || otherFieldErrors.length) {
      notifications.error({
        duration: DEFAULT_NOTIFICATION_DURATION,
        variant: "outline-dark",
        group: "GenericError",
        singleInGroup: true,
        text: getErrorNotificationText(otherFieldErrors),
      });
    }

    return messages;
  }

  return {
    getErrorNotificationText,
    showSaveErrors,
  };
}
