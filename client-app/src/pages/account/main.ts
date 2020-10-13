import Vue from "vue";
import i18n from "@i18n";
import InitializationService from "core/services/initialization.service";
import { AuthorizationPlugin } from "libs/authorization/plugins/authorization.plugin";
import { FETCH_PROFILE } from "libs/authorization/store/profile/definitions";
import usersListModule from "libs/user/store/users-list";
import store from "store";
import App from "@account/App.vue";
import router from "@account/router";

InitializationService.initializeCommon().then(() => {
  store.registerModule("usersListModule", usersListModule);


  //custom plugins
  Vue.use(AuthorizationPlugin, { store });

  store.dispatch(`profileModule/${FETCH_PROFILE}`).then(() => {
    new Vue({
      i18n,
      router,
      store,
      render: h => h(App)
    }).$mount("#app");
  });
});
