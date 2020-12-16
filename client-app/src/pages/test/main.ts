import Vue from "vue";
import { SfLoader } from '@storefront-ui/vue';
import i18n from "@i18n";
import SimpleCounter from "@libs/test/views/simple-counter/index.vue";
import store from "store";
import InitializationService from "@core/services/initialization.service";

InitializationService.initializeCommon().then(() => {
  new Vue({
    i18n,
    store,
    render: h => h(SfLoader)
  }).$mount("#loader");

  new Vue({
    i18n,
    store,
    render: h => h(SimpleCounter)
  }).$mount("#composition-api-test");
});
