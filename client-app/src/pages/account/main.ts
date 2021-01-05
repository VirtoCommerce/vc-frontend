import Vue from "vue";
import i18n from "@i18n";
import InitializationService from "@core/services/initialization.service";
import router from "./router";
import Login from "./views/Login.vue";
import Register from "./views/Register.vue";

InitializationService.initializeCommon().then(() => {
  // include error handling
  if (document.getElementById("account")) {
    new Vue({
      i18n,
      router,
      template: "<router-view></router-view>"
    }).$mount("#account");
  }
  if (document.getElementById("register")) {
    new Vue({
      i18n,
      router,
      render: h => h(Register)
    }).$mount("#register");
  }
  if (document.getElementById("login")) {
    new Vue({
      i18n,
      router,
      render: h => h(Login)
    }).$mount("#login");
  }
});
