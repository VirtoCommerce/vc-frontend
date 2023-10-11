import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { Ref, ComputedRef } from "vue";

type ErrorType = {
  code?: string;
  description?: string;
  parameter?: string;
};

type TranslatedErrorType = ErrorType & { translation?: string };

type ComputedTranslatedErrorsType = { translatedErrors: ComputedRef<TranslatedErrorType[]> };

export function useErrorsTranslator(
  keyInLocale: string,
  errors: Ref<ErrorType[] | undefined>,
): ComputedTranslatedErrorsType;
export function useErrorsTranslator(
  keyInLocale: string,
  errors: Ref<ErrorType[] | undefined>,
): ComputedTranslatedErrorsType {
  const { t, te } = useI18n();

  const translatedErrors = computed<TranslatedErrorType[]>(() => {
    return (
      errors.value?.map((error: ErrorType) => {
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
