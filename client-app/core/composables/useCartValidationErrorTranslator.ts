import { useI18n } from "vue-i18n";
import type { ValidationErrorType } from "@/core/api/graphql/types";

export function useCartValidationErrorTranslator() {
  const { t, te } = useI18n();

  return (error: ValidationErrorType): string | undefined => {
    const parameters =
      error.errorParameters?.reduce((result, item) => ({ ...result, [item.key]: item.value }), {}) || {};
    const translationKey = "validation_error." + error.errorCode;
    return te(translationKey) ? t(translationKey, parameters) : error.errorMessage;
  };
}
