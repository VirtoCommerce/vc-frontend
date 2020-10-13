import Vue from "vue";
import i18n from "@i18n";
import InitializationService from "core/services/initialization.service";
import cartModule from "libs/shopping-cart/store/cart";
import AddToCartButton from "libs/shopping-cart/views/add-to-cart-button/index.vue";
import CartButton from "libs/shopping-cart/views/cart-button/index.vue";
import store from "store";
import ActiveOrderSidebar from "./views/active-order-sidebar/index.vue";

store.registerModule("cart", cartModule);

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
