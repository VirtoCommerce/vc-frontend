import Vue, { VNode } from "vue";
import { LocaleMessages } from "vue-i18n";
import { Dictionary } from './core/models/dictionary';

declare global {
  namespace JSX {
    // tslint:disable no-empty-interface
    interface Element extends VNode {}
    // tslint:disable no-empty-interface
    interface ElementClass extends Vue {}
    interface IntrinsicElements {
      [elem: string]: any;
    }
  }

  interface Window {
    BASE_URL: string;
    STORE_NAME: string;
    STORE_ID: string;
    STORE_LANGUAGES: object[];
    CURRENCY_CODE: string;
    LOCALE: string;
    USER_ID: string;
    THEME_SETTINGS: Dictionary<any>;
    CATALOG_ID: string;
    CATEGORY_ID: string;
    PRODUCT_ID: string;
    FALLBACK_IMG_URL: string;
    LOCALIZATION_MESSAGES: LocaleMessages;
    MAIN_MENU: object[];
    LOCALES: object[];
  }

}
