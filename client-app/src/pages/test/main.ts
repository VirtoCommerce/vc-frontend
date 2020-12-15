import Vue from "vue";
import i18n from "@i18n";
import Loader from "@libs/loader/views/loader/index.vue";
import store from "store";
import InitializationService from "@core/services/initialization.service";

InitializationService.initializeCommon().then(() => {
  new Vue({
    i18n,
    store,
    render: h => h(Loader)
  }).$mount("#loader");
});
