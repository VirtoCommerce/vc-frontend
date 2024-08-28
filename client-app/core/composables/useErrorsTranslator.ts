import { computed, ref, unref } from "vue";
import { useI18n } from "vue-i18n";
import type { NamedValue } from "vue-i18n";

function asKey<T>(key: string): keyof T {
  return key as keyof T;
}

export function useErrorsTranslator<T extends object>(localeItemsGroupKey: string) {
  const { t, te } = useI18n();

  const errors = ref<T[]>();

  function setErrors(errs: T[]): void {
    errors.value = errs;
  }

  function getErrorValue<K extends keyof T>(error: T, keys: K[]): T[K] | undefined {
    const keyInError = keys.find((key) => key in error);
    return keyInError ? error[keyInError] : undefined;
  }

  function getErrorParameters(error: T): string[] | NamedValue | undefined {
    const parameter = getErrorValue(error, [asKey<T>("parameter")]);
    if (parameter) {
      return [parameter as string];
    }

    const parameters = getErrorValue(error, [asKey<T>("errorParameters")]) as Array<{ key: string; value: string }>;
    if (parameters) {
      return parameters.reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {} as NamedValue);
    }
  }

  function translate(error: T): string | undefined {
    const code = getErrorValue(error, [asKey<T>("code"), asKey<T>("errorCode")]) as string;
    const localeKey = `${localeItemsGroupKey}.${code}`;
    const parameters = getErrorParameters(error) ?? [];

    return te(localeKey)
      ? t(localeKey, parameters as NamedValue)
      : (getErrorValue(error, [asKey<T>("description"), asKey<T>("errorMessage")]) as string);
  }

  const localizedItemsErrors = computed<Record<string, string[]>>(
    () =>
      unref(errors)?.reduce(
        (acc, err) => {
          const objectId = getErrorValue(err, [asKey<T>("objectId")]) as string;
          if (objectId) {
            const translatedError = translate(err);
            if (translatedError) {
              acc[objectId] = acc[objectId] ? [...acc[objectId], translatedError] : [translatedError];
            }
          }
          return acc;
        },
        {} as Record<string, string[]>,
      ) || {},
  );

  return {
    localizedItemsErrors,
    setErrors,
    translate,
  };
}
