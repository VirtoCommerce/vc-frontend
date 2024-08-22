import { computed, unref } from "vue";
import { useI18n } from "vue-i18n";
import type {
  IdentityErrorInfoType,
  IdentityErrorType,
  RegistrationErrorType,
  ValidationErrorType,
} from "../api/graphql/types";
import type { ErrorType } from "../types";
import type { MaybeRef } from "vue";
import type { NamedValue } from "vue-i18n";

export function useErrorsTranslator(
  localeItemsGroupKey: string,
  errors?: MaybeRef<IdentityErrorType[] | IdentityErrorInfoType[] | RegistrationErrorType[] | ValidationErrorType[]>,
) {
  const { t, te } = useI18n();

  function mapToError(
    error: IdentityErrorType | IdentityErrorInfoType | RegistrationErrorType | ValidationErrorType,
  ): ErrorType {
    const result: ErrorType = {
      objectId: "objectId" in error ? error.objectId : undefined,
      code: "code" in error ? error.code : "errorCode" in error ? error.errorCode : undefined,
      description:
        "description" in error ? error.description : "errorMessage" in error ? error.errorMessage : undefined,
    };

    if ("parameter" in error && !!error.parameter) {
      result.parameters = [error.parameter];
    }

    if ("errorParameters" in error) {
      result.parameters = error.errorParameters?.reduce((acc, err) => {
        acc[err.key] = err.value;
        return acc;
      }, {} as NamedValue);
    }

    return result;
  }

  function translate(
    errorToTranslate: IdentityErrorType | IdentityErrorInfoType | RegistrationErrorType | ValidationErrorType,
  ): string | undefined {
    const error = mapToError(errorToTranslate);

    const localeKey = `${localeItemsGroupKey}.${error.code}`;
    const parameters = error.parameters ?? [];

    return te(localeKey) ? t(localeKey, parameters as NamedValue) : error.description;
  }

  const localizedItemsErrors = computed<Record<string, string[]>>(() => {
    return (
      unref(errors)?.reduce(
        (acc, err) => {
          if ("objectId" in err && !!err.objectId) {
            const translatedError = translate(err);

            if (translatedError) {
              if (acc[err.objectId]) {
                acc[err.objectId].push(translatedError);
              } else {
                acc[err.objectId] = [translatedError];
              }
            }
          }

          return acc;
        },
        {} as Record<string, string[]>,
      ) || {}
    );
  });

  return {
    localizedItemsErrors,
    translate,
  };
}
