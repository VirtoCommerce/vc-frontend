import Vue from "vue";
import i18n from "@i18n";
import InitializationService from "@core/services/initialization.service";
import router from "./router";


InitializationService.initializeCommon().then(() => {

  // include error handling
  new Vue({
    i18n,
    router,
    template: "<router-view></router-view>"
  }).$mount("#account");
});
