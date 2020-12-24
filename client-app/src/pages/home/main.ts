import Vue from "vue";
import i18n from "@i18n";
import { HeroSlider } from '@libs/home/index.ts'
import InitializationService from "@core/services/initialization.service";

InitializationService.initializeCommon().then(() => {
  new Vue({
    i18n,
    render: h => h(HeroSlider)
  }).$mount("#hero-slider");
});
