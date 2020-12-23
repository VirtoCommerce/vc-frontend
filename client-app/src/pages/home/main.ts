import Vue from "vue";
import i18n from "@i18n";
import InitializationService from "@core/services/initialization.service";
import HeroSlider from "./views/HeroSlider.vue"

InitializationService.initializeCommon().then(() => {
  new Vue({
    i18n,
    render: h => h(HeroSlider)
  }).$mount("#hero-slider");
});
