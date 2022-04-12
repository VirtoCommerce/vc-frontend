import { themeContext } from "./../utilities/context/index";
import { computed, readonly, ref } from "vue";
import { useI18n } from "vue-i18n";
import { setI18nLocale } from "@/i18n";

export default () => {
  const i18n = useI18n();

  const defaultLanguage = readonly(ref(themeContext.defaultLanguage));

  const availableLanguages = readonly(ref(themeContext.availLanguages));

  const currentLanguage = computed(() =>
    themeContext.availLanguages?.find((x) => x.twoLetterLanguageName === i18n.locale.value)
  );

  function setLocaleAndReload(locale: string) {
    setI18nLocale(locale);
    location.href = "/";
  }

  return {
    ...i18n,
    currentLocale: readonly(i18n.locale),
    currentLanguage,
    defaultLanguage,
    availableLanguages,
    setI18nLocale,
    setLocaleAndReload,
  };
};
