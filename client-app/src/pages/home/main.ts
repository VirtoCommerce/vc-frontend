import Vue from "vue";
import i18n from "@i18n";
import { AddToCartButton } from '@libs/cart/index.ts';
import { HeroSlider } from '@libs/home/index.ts';
import { AppHeader } from "@libs/misc";
import InitializationService from "@core/services/initialization.service";

if (document.getElementById("appHeader")) {
  new Vue({
    i18n,
    render: h => h(AppHeader)
  }).$mount("#appHeader");
}


function addHeroSlider(initializator: Promise<void>): Promise<void> {
  return initializator.then(() => {
    new Vue({
      i18n,
      render: h => h(HeroSlider)
    }).$mount("#hero-slider");
  });
}


const initializator = InitializationService.initializeCommon();
addHeroSlider(initializator);
//addAddProductButtons(initializator);
