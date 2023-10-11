import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { Ref, ComputedRef } from "vue";

type ErrorType = {
  code?: string;
  description?: string;
  parameter?: string;
};

type ErrorToStringType = {
  (error: ErrorType): string | undefined;
};

type TranslatedErrorType = ErrorType & { translation?: string };

type ComputedTranslatedErrorsType = { translatedErrors: ComputedRef<TranslatedErrorType[]> };

/** @deprecated Use useErrorsTranslator('path in locale', Array<errors>) */
export function useErrorsTranslator(keyInLocale?: string): ErrorToStringType;
export function useErrorsTranslator(
  keyInLocale?: string,
  errors?: Ref<ErrorType[] | undefined>,
): ComputedTranslatedErrorsType;
export function useErrorsTranslator(
  keyInLocale = "identity_error.",
  errors?: Ref<ErrorType[] | undefined>,
): ErrorToStringType | ComputedTranslatedErrorsType {
  const { t, te } = useI18n();

  if (errors) {
    const translatedErrors = computed<TranslatedErrorType[]>(() => {
      return (
        errors?.value?.map((error: ErrorType) => {
          const translationKey = keyInLocale + error.code;
          return {
            ...error,
            translation: te(translationKey) ? t(translationKey, [error.parameter]) : error.description,
          };
        }) || []
      );
    });

    return { translatedErrors };
  }
  return (error: ErrorType): string | undefined => {
    const translationKey = keyInLocale + error.code;

    return te(translationKey) ? t(translationKey, [error.parameter]) : error.description;
  };
}
