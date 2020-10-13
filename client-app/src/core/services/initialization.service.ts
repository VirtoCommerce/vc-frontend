import Vue from "vue";
import VueAxios from "vue-axios";
import Loading from "vue-loading-overlay";
import "vue-moment";
import VueRx from "vue-rx";
import Vuelidate from "vuelidate";
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
  faSearch,
  faUnlock
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon, FontAwesomeLayers } from "@fortawesome/vue-fontawesome";
import {
  ButtonPlugin,
  CollapsePlugin,
  PaginationPlugin,
  TablePlugin,
  ToastPlugin,
  ModalPlugin,
  CardPlugin,
  DropdownPlugin,
  FormCheckboxPlugin,
  FormGroupPlugin,
  FormDatepickerPlugin,
  FormInputPlugin,
  FormPlugin,
  FormSelectPlugin,
  InputGroupPlugin,
  TooltipPlugin,
  SidebarPlugin,
  OverlayPlugin
} from "bootstrap-vue";
import { SetLocale } from "@i18n";
import { locale } from "core/constants";
import axios from "core/services/axios-instance";
import "@core/filters/img-url";
import "@core/directives/only-number";

export default class InitializationService {
  static async initializeCommon(): Promise<void> {
    Vue.config.productionTip = false;

    // window.onerror will not catch error if we will simple throw it, it still be unhandled.
    // instead of that, we calling window.onerror directly
    // undefined used here because js & ts doesn't support set optional parameters by parameter name
    Vue.config.errorHandler = (err, _vm, info) => {
      if (window.onerror) {
        window.onerror(info, undefined, undefined, undefined, err);
      }
    };

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

    //plugins
    Vue.use(VueRx);
    Vue.use(VueAxios, axios);

    // workaround because of unstable build caused by broken .d.ts
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    Vue.use(require("vue-moment"));
    Vue.use(Vuelidate);
    Vue.use(ButtonPlugin);
    Vue.use(CollapsePlugin);
    Vue.use(PaginationPlugin);
    Vue.use(TablePlugin);
    Vue.use(ToastPlugin);
    Vue.use(ModalPlugin);
    Vue.use(CardPlugin);
    Vue.use(FormDatepickerPlugin);
    Vue.use(FormInputPlugin);
    Vue.use(DropdownPlugin);
    Vue.use(FormCheckboxPlugin);
    Vue.use(FormGroupPlugin);
    Vue.use(FormPlugin);
    Vue.use(FormSelectPlugin);
    Vue.use(InputGroupPlugin);
    Vue.use(TooltipPlugin);
    Vue.use(SidebarPlugin);
    Vue.use(OverlayPlugin);

    Vue.component("font-awesome-icon", FontAwesomeIcon);
    Vue.component("font-awesome-layers", FontAwesomeLayers);

    //global components
    Vue.component("loading", Loading);
  }
}
