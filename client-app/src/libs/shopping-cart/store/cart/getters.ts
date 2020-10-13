import { GetterTree } from "vuex";
import { RootState } from 'store/types';
import { CartType } from '@core/api/graphql/types';
import {  CartState } from "./types";

// getters
export const getters: GetterTree<CartState, RootState> = {
  isLoading: (state: CartState): boolean => {
    return state.isLoading;
  },
  cart: (state: CartState): CartType | null => {
    return state.cart;
  },
  itemsQuantity: (state: CartState): number  => {
    return state.cartItemsCount;
  },
  sidebarVisible: (state: CartState): boolean => state.sidebarVisible
};
