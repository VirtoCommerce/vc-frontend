import Vue from "vue";
import VueAxios from "vue-axios";
import VueMoment from 'vue-moment';
import { library, dom } from "@fortawesome/fontawesome-svg-core";
import {
  faHeartBroken,
  faLock,
  faMeteor,
  faThLarge,
  faList,
  faShoppingCart,
  faCamera,
  faCalculator,
  faChartBar,
  faFileAlt,
  faSearch
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon, FontAwesomeLayers } from "@fortawesome/vue-fontawesome";
import { SetLocale } from "@i18n";
import { locale } from "core/constants";
import axios from "core/services/axios-instance";
import "@core/filters";
import "@core/directives/only-number";
//This is required https://stackoverflow.com/questions/61885716/uncaught-error-vue-composition-api-must-call-vue-useplugin-before-using-any
import './installCompositionApi';

export default class InitializationService {
  static async initializeCommon(): Promise<void> {

    Vue.config.productionTip = false;

    // Add here icons which you need in liquid
    library.add(
      faHeartBroken,
      faLock,
      faMeteor,
      faThLarge,
      faList,
      faShoppingCart,
      faCamera,
      faCalculator,
      faChartBar,
      faFileAlt,
      faSearch
    );

    dom.watch();

    // Load data for apps
    await Promise.all([SetLocale(locale)]);

    // Plugins
    Vue.use(VueAxios, axios);
    Vue.use(VueMoment);

    Vue.component("font-awesome-icon", FontAwesomeIcon);
    Vue.component("font-awesome-layers", FontAwesomeLayers);
  }
}
