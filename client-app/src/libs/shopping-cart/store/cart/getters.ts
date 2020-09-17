import { GetterTree } from "vuex";
import { ShoppingCart } from "core/api/api-clients";
import { RootState } from 'store/types';
import {  CartState } from "./types";

// getters
export const getters: GetterTree<CartState, RootState> = {
  isLoading: (state: CartState): boolean => {
    return state.isLoading;
  },
  cart: (state: CartState): ShoppingCart | null => {
    return state.cart;
  },
  itemsQuantity: (state: CartState): number  => {
    return state.cartItemsCount;
  },
  sidebarVisible: (state: CartState): boolean => state.sidebarVisible,
  changeProductIdSet: (state: CartState): string[] => state.changeProductIdSet
};
