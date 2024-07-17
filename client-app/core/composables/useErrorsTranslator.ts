import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { Ref, ComputedRef } from "vue";
import type { NamedValue } from "vue-i18n";

export type ErrorType = {
  id?: string;
  code?: string;
  description?: string;
  parameter?: string;
  parameters?: string[] | NamedValue;
};

type TranslatedErrorType = ErrorType & { translation?: string };
type IdErrorsType = Record<string, TranslatedErrorType[]>;

type ComputedTranslatedErrorsType = {
  translatedErrors: ComputedRef<TranslatedErrorType[]>;
  idErrors: ComputedRef<IdErrorsType>;
  getTranslation: (error: ErrorType) => string | undefined;
};

export function useErrorsTranslator(
  keyInLocale: string,
  errors?: Ref<ErrorType[] | undefined> | ComputedRef<ErrorType[] | undefined>,
): ComputedTranslatedErrorsType {
  function getTranslation(error: ErrorType) {
    const translationKey = `${keyInLocale}.${error.code}`;

    /**
     * `errorParameters can be array or object.
     * examples: ['foo', 'bar'], { first: 'foo', second: 'bar' }
     */
    const errorParameters = error.parameters ? error.parameters : error.parameter ? [error.parameter] : [];
    return te(translationKey) ? t(translationKey, errorParameters as NamedValue) : error.description;
  }

  const { t, te } = useI18n();

  const translatedErrors = computed<TranslatedErrorType[]>(() => {
    return (
      errors?.value?.map((error: ErrorType) => {
        return {
          ...error,
          translation: getTranslation(error),
        };
      }) || []
    );
  });

  const idErrors = computed<IdErrorsType>(() => {
    return (
      errors?.value?.reduce((records, error) => {
        if (error.id) {
          const key = error.id;
          const translatedError = {
            ...error,
            translation: getTranslation(error),
          };

          if (records[key]) {
            records[key].push(translatedError);
          } else {
            records[key] = [translatedError];
          }
        }

        return records;
      }, {} as IdErrorsType) || {}
    );
  });

  return { translatedErrors, idErrors, getTranslation };
}
