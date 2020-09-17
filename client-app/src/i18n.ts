import Vue from "vue";
import VueI18n from "vue-i18n";

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: window.LOCALE,
  fallbackLocale: "en",
  messages: {
    [window.LOCALE]: window.LOCALIZATION_MESSAGES
  }
});

export default i18n;
