import Vue from "vue";
import i18n from "@i18n";
import profileModule from "@libs/authorization/store/profile";
import { FETCH_PROFILE } from "@libs/authorization/store/profile/definitions";
import ErrorPopup from "@libs/error-handling/views/error-popup/index.vue";
import cartModule from "@libs/shopping-cart/store/cart";
import AddToCartButton from "@libs/shopping-cart/views/add-to-cart-button/index.vue";
import CartButton from "@libs/shopping-cart/views/cart-button/index.vue";
import errorHandlingModule from "libs/error-handling/store";
import store from "store";
import InitializationService from "@core/services/initialization.service";
import ActiveOrderSidebar from "./views/active-order-sidebar/index.vue";

// register libraries store
store.registerModule("cart", cartModule);
store.registerModule("profileModule", profileModule);
store.registerModule("errorHandling", errorHandlingModule);

InitializationService.initializeCommon().then(() => {
  const addToCartElements = document.getElementsByClassName("app-add-item-to-cart");

  for (const addToCartEl of addToCartElements) {
    const productId = addToCartEl.attributes.getNamedItem("product-id")!.value;
    const textVisible = !!addToCartEl.attributes.getNamedItem("text-visible");
    new Vue({
      i18n,
      store,
      render(h) {
        return h(AddToCartButton, {
          props: {
            productId: productId,
            textVisible: textVisible
          }
        });
      }
    }).$mount(addToCartEl);
  }

  // include error handling
  new Vue({
    i18n,
    store,
    render: h => h(ErrorPopup)
  }).$mount("#error-popup");

  store.dispatch(`profileModule/${FETCH_PROFILE}`).then(() => {
    new Vue({
      i18n,
      store,
      render: h => h(CartButton)
    }).$mount("#app-cart");

    new Vue({
      i18n,
      store,
      render: h => h(ActiveOrderSidebar)
    }).$mount("#app-cart-sidebar");
  });
});
