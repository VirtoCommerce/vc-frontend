import { MutationTree } from "vuex";
import { CartType } from '@core/api/graphql/types';
import { fetchAsync, setAsync } from "@core/utilities/async-state";
import { FETCH_CART } from "./definitions";
import { CartState } from "./types";

export const SET_CART = "setCart";
export const SET_CART_ITEMS_COUNT = "setCartItemsCount";
export const SET_SIDEBAR_VISIBLE = "setSidebarVisible";

//mutations
export const mutations: MutationTree<CartState> = {

  [FETCH_CART](state) {
    fetchAsync(state);
  },
  [SET_CART](state, payload: CartType) {
    state.cart = payload;
    setAsync(state);
  },
  [SET_CART_ITEMS_COUNT](state, payload: number){
    state.cartItemsCount = payload;
  },
  [SET_SIDEBAR_VISIBLE](state, payload: boolean){
    state.sidebarVisible = payload;
  }

};
