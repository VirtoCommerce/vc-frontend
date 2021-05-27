import Vue from "vue";
import i18n from "@i18n";
import { HeroSlider } from '@libs/home/index.ts';
import { AppHeader } from "@libs/misc";
import InitializationService from "@core/services/initialization.service";

InitializationService.initializeCommon().then(() => {

  if (document.getElementById("appHeader")) {
    new Vue({
      i18n,
      render: h => h(AppHeader)
    }).$mount("#appHeader");
  }

  if (document.getElementById("hero-slider")) {
    new Vue({
      i18n,
      render: h => h(HeroSlider)
    }).$mount("#hero-slider");
  }});
//addAddProductButtons(initializator);
