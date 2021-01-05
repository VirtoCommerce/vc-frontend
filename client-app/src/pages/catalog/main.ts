import Vue from "vue";
import i18n from "@i18n";
import { AppHeader } from "@libs/misc";
import InitializationService from "@core/services/initialization.service";
import router from "./router";

InitializationService.initializeCommon().then(() => {

  if (document.getElementById("appHeader")) {
    new Vue({
      i18n,
      router,
      render: h => h(AppHeader)
    }).$mount("#appHeader");
  }

  // include error handling
  new Vue({
    i18n,
    router,
    template: "<router-view></router-view>"
  }).$mount("#category");
});
