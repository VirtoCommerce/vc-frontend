import Vue from "vue";
import i18n from "@i18n";
import InitializationService from "@core/services/initialization.service";
import CategoryView from "./views/category/index.vue";


InitializationService.initializeCommon().then(() => {

  // include error handling
  new Vue({
    i18n,
    render: h => h(CategoryView)
  }).$mount("#category");


});
