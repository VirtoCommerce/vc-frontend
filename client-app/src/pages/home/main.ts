import Vue from "vue";
import i18n from "@i18n";
import { AddToCartButton, Dummy as DummyFromCartLib } from '@libs/cart/index.ts';
import { HeroSlider, Dummy as DummyFromHomeLib } from '@libs/home/index.ts';
import InitializationService from "@core/services/initialization.service";

function addHeroSlider(initializator: Promise<void>): Promise<void> {
  return initializator.then(() => {
    new Vue({
      i18n,
      render: h => h(HeroSlider)
    }).$mount("#hero-slider");
  });
}

function addAddProductButtons(initializator: Promise<void>): Promise<void> {
  const addToCartElements = document.getElementsByClassName("app-add-item-to-cart");
  for (const addToCartEl of addToCartElements) {
    initializator = initializator.then(() => {
      new Vue({
        i18n,
        render: h => h(DummyFromHomeLib, {
          props: {
            buyable: addToCartEl.attributes.getNamedItem("buyable")?.value,
            productId: addToCartEl.attributes.getNamedItem("product-id")?.value,
            title: addToCartEl.attributes.getNamedItem("title")?.value
          }
        })
      }).$mount(addToCartEl);
    })
  }
  return initializator;
}

const initializator = InitializationService.initializeCommon();
addHeroSlider(initializator);
//addAddProductButtons(initializator);
