import Vue from "vue";
import i18n from "@i18n";
import { AddToCartButton } from '@libs/cart/index.ts'
import { HeroSlider } from '@libs/home/index.ts'
import InitializationService from "@core/services/initialization.service";

InitializationService.initializeCommon().then(() => {
  const addToCartElements = document.getElementsByClassName("app-add-item-to-cart");
  for (const addToCartEl of addToCartElements) {
    const productId = addToCartEl.attributes.getNamedItem("product-id")!.value
    const title = addToCartEl.attributes.getNamedItem("title")!.value
    const buyable = addToCartEl.attributes.getNamedItem("text-visible")!.value;
    new Vue({
      i18n,
      render ( h ) {
        return h(AddToCartButton, {
          props: {
            buyable: buyable,
            productId: productId,
            title: title
          }
        })
      }
    }).$mount(addToCartEl);
  }

  new Vue({
    i18n,
    render: h => h(HeroSlider)
  }).$mount("#hero-slider");
});
