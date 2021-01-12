import Vue from "vue";
import i18n from "@i18n";
import { AppHeader, AppFooter } from "@libs/misc";
import InitializationService from "@core/services/initialization.service";
import router from "./router";

InitializationService.initializeCommon().then(() => {

  if (document.getElementById("appHeader")) {
    new Vue({
      i18n,
      render: h => h(AppHeader)
    }).$mount("#appHeader");
  }
  if (document.getElementById("appFooter")) {
    new Vue({
      i18n,
      render: h => h(AppFooter)
    }).$mount("#appFooter");
  }

  if (document.getElementById("checkout")) {
    new Vue({
      i18n,
      router,
      template: "<router-view></router-view>"
    }).$mount("#checkout");
  }

});
