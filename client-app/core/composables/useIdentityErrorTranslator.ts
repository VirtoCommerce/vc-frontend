import { useI18n } from "vue-i18n";
import type { IdentityErrorInfoType, RegistrationErrorType } from "@/core/api/graphql/types";

export function useIdentityErrorTranslator() {
  const { t, te } = useI18n();

  return (error: IdentityErrorInfoType | RegistrationErrorType): string | undefined => {
    const parameter = error.parameter;
    const translationKey = "identity_error." + error.code;
    return te(translationKey) ? t(translationKey, [parameter]) : error.description;
  };
}
