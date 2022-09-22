import { useI18n } from "vue-i18n";
import { IdentityErrorInfoType, IdentityErrorType, RegistrationErrorType } from "@/xapi/types";

export default function useIdentityErrorTranslator() {
  const { t } = useI18n();

  return (error: IdentityErrorType | IdentityErrorInfoType | RegistrationErrorType): string | undefined => {
    const parameter = (error as RegistrationErrorType).parameter || (error as IdentityErrorInfoType).errorParameter;
    const translationKey = "identity_error." + error.code;
    const translationResult = t(translationKey, [parameter]);
    return translationResult !== translationKey ? translationResult : error.description;
  };
}
