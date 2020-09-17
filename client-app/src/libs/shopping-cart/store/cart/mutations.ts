import { MutationTree } from "vuex";
import { ShoppingCart } from 'core/api/api-clients';
import { fetchAsync, setAsync } from "@core/utilities/async-state";
import { FETCH_CART } from "./definitions";
import { CartState } from "./types";

export const SET_CART = "setCart";
export const SET_CART_ITEMS_COUNT = "setCartItemsCount";
export const SET_SIDEBAR_VISIBLE = "setSidebarVisible";
export const ADD_PRODUCT_TO_CHANGE_SET = "addProductToChangeSet";
export const REMOVE_PRODUCT_FROM_CHANGE_SET = "removeProductFromChangeSet";

//mutations
export const mutations: MutationTree<CartState> = {

  [FETCH_CART](state) {
    fetchAsync(state);
  },
  [SET_CART](state, payload: ShoppingCart) {
    state.cart = payload;
    setAsync(state);
  },
  [SET_CART_ITEMS_COUNT](state, payload: number){
    state.cartItemsCount = payload;
  },
  [SET_SIDEBAR_VISIBLE](state, payload: boolean){
    state.sidebarVisible = payload;
  },
  [ADD_PRODUCT_TO_CHANGE_SET](state, payload: string) {
    if(payload) {
      state.changeProductIdSet.push(payload);
    }
  },
  [REMOVE_PRODUCT_FROM_CHANGE_SET](state, payload: string) {
    if(payload) {
      const idx =  state.changeProductIdSet.indexOf(payload);
      state.changeProductIdSet.splice(idx, 1);
    }
  }

};
