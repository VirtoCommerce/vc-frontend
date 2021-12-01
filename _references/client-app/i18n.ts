import Vue from "vue";
import VueI18n, { LocaleMessages } from 'vue-i18n';
import axios from './core/services/axios-instance';
import { baseUrl } from '@core/constants';


Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: window.LOCALE,
  fallbackLocale: "en",
  messages: {
    [window.LOCALE]: window.LOCALIZATION_MESSAGES
  }
});

export function SetLocale(locale: string): Promise<LocaleMessages> {
  return axios.get(`${baseUrl}/${locale}/themes/localization.json?lang=${locale}`)
    .then(({ data }) => {
      i18n.setLocaleMessage(locale, data);
      return data;
    });
}


export default i18n;
