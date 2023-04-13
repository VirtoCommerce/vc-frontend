import { useI18n } from "vue-i18n";
import type { ValidationErrorType } from "@/xapi/types";

export function useValidationErrorTranslator() {
  const { t, te } = useI18n();

  return (error: ValidationErrorType): string | undefined => {
    const translationKey = "validation_error." + error.errorCode;
    return te(translationKey) ? t(translationKey) : error.errorMessage;
  };
}
