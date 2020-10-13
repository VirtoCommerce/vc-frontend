import { Module } from "vuex";
import { RootState } from 'store/types';
import { actions } from "./actions";
import { getters } from "./getters";
import { mutations } from "./mutations";
import { CartState } from "./types";


// initial state
export const initialState: CartState = {
  cart: null,
  cartItemsCount: 0,
  isLoading: false,
  loaded: false,
  sidebarVisible: false,
  errors: []
};


const cartModule: Module<CartState, RootState> = {
  namespaced: true,
  state: initialState,
  getters,
  actions,
  mutations
};

export default cartModule;
