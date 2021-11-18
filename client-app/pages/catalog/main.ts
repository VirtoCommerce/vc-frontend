import Vue from "vue";
import i18n from "@i18n";
import { AppHeader } from "@libs/misc";
import InitializationService from "@core/services/initialization.service";
import router from "./router";
import Product from "./views/Product.vue";

InitializationService.initializeCommon().then(() => {
  if (document.getElementById("appHeader")) {
    new Vue({
      i18n,
      router,
      render: h => h(AppHeader)
    }).$mount("#appHeader");
  }

  if (document.getElementById("product")) {
    new Vue({
      i18n,
      render: h => h(Product)
    }).$mount("#product");
  }

  if (document.getElementById("category")) {
    new Vue({
      i18n,
      router,
      template: "<router-view></router-view>"
    }).$mount("#category");
  }
});
