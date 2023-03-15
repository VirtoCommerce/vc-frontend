import { useI18n } from "vue-i18n";
import type { IdentityErrorInfoType, RegistrationErrorType } from "@/xapi/types";

export function useIdentityErrorTranslator() {
  const { t } = useI18n();

  return (error: IdentityErrorInfoType | RegistrationErrorType): string | undefined => {
    const parameter = error.parameter;
    const translationKey = "identity_error." + error.code;
    const translationResult = t(translationKey, [parameter]);
    return translationResult !== translationKey ? translationResult : error.description;
  };
}
