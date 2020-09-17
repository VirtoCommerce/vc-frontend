import Vue from "vue";
import i18n from "@i18n";
import { CartSearchCriteria } from "core/api/api-clients";
import { orderDraftType, startPageNumber, catalogOrderDraftsCount } from "core/constants";
import InitializationService from "core/services/initialization.service";
import draftsListModule from "libs/order-draft/store/drafts-list"
import { SET_DRAFTS_SEARCH_CRITERIA } from 'libs/order-draft/store/drafts-list/definitions';
import cartModule from "libs/shopping-cart/store/cart";
import AddToCartButton from "libs/shopping-cart/views/add-to-cart-button/index.vue";
import AddToDraftButton from "libs/shopping-cart/views/add-to-order-draft-button/index.vue";
import CartButton from "libs/shopping-cart/views/cart-button/index.vue";
import store from "store";
import ActiveOrderSidebar from './views/active-order-sidebar/index.vue';


store.registerModule("cart", cartModule);
store.registerModule("draftsListModule", draftsListModule)

InitializationService.initializeCommon();

const addToCartElements = document.getElementsByClassName("app-add-item-to-cart");

for(const addToCartEl of addToCartElements){
  const productId = addToCartEl.attributes.getNamedItem("product-id")!.value
  const textVisible = !!addToCartEl.attributes.getNamedItem("text-visible");
  new Vue({
    i18n,
    store,
    render ( h ) {
      return h(AddToCartButton, {
        props: {
          productId: productId,
          textVisible: textVisible
        }
      })
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


const criteria = new CartSearchCriteria();
criteria.pageNumber = startPageNumber;
criteria.pageSize = catalogOrderDraftsCount;
criteria.type = orderDraftType;
store.dispatch(`draftsListModule/${SET_DRAFTS_SEARCH_CRITERIA}`, criteria);


const addToDraftElements = document.getElementsByClassName("app-add-item-to-draft");

for(const addToDraftEl of addToDraftElements){
  const productId = addToDraftEl.attributes.getNamedItem("product-id")!.value
  const textVisible = !!addToDraftEl.attributes.getNamedItem("text-visible");
  new Vue({
    i18n,
    store,
    render ( h ) {
      return h(AddToDraftButton, {
        props: {
          productId: productId,
          textVisible: textVisible
        }
      })
    }
  }).$mount(addToDraftEl);
}
