import Vue from "vue";
import i18n from "@i18n";
import { AppHeader } from "@libs/misc";
import InitializationService from "@core/services/initialization.service";
import Home  from './views/Home.vue';

InitializationService.initializeCommon().then(() => {
  if (document.getElementById("appHeader")) {
    new Vue({
      i18n,
      render: h => h(AppHeader)
    }).$mount("#appHeader");
  }

  if (document.getElementById("home")) {
    new Vue({
      i18n,
      render: h => h(Home)
    }).$mount("#home");
  }});
//addAddProductButtons(initializator);
