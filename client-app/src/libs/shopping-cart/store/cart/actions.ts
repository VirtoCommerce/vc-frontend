import { ActionTree } from "vuex";
import { graphqlCartClient } from "core/services/api-clients.service";
import { RootState } from "store/types";
import { InputAddItemType, InputChangeCartItemQuantityType } from "@core/api/graphql/types";
import {
  FETCH_CART,
  FETCH_CART_ITEMS_COUNT,
  ADD_ITEM_TO_CART,
  DELETE_ITEM_FROM_CART,
  CLEAR_CART,
  CHANGE_ITEM_QUANTITY,
  SHOW_CART_SIDEBAR,
  HIDE_CART_SIDEBAR,
  CHECKOUT
} from "./definitions";
import { SET_CART, SET_CART_ITEMS_COUNT, SET_SIDEBAR_VISIBLE } from "./mutations";
import { CartState } from "./types";

//actions
export const actions: ActionTree<CartState, RootState> = {
  async [FETCH_CART](context) {
    context.commit(FETCH_CART);
    const result = await graphqlCartClient.getCart();
    context.commit(SET_CART, result);
    context.commit(SET_CART_ITEMS_COUNT, result.itemsQuantity);
  },
  async [FETCH_CART_ITEMS_COUNT](context) {
    //TODO: replace later to the special graphql query
    const result = await graphqlCartClient.getCart();
    context.commit(SET_CART_ITEMS_COUNT, result.itemsCount);
  },
  async [ADD_ITEM_TO_CART](context, payload: InputAddItemType) {
    context.commit(FETCH_CART);
    const result = await graphqlCartClient.addItemToCart(payload);
    context.commit(SET_CART_ITEMS_COUNT, result);
    await context.dispatch(FETCH_CART);
  },
  async [CHANGE_ITEM_QUANTITY](context, payload: InputChangeCartItemQuantityType) {
    context.commit(FETCH_CART);
    const itemsCount = await graphqlCartClient.changeCartItem(payload);
    context.commit(SET_CART_ITEMS_COUNT, itemsCount);
    await context.dispatch(FETCH_CART);
  },
  async [DELETE_ITEM_FROM_CART](context, payload: string) {
    context.commit(FETCH_CART);
    await graphqlCartClient.removeCartItem(payload);
    await context.dispatch(FETCH_CART);
  },
  async [CLEAR_CART](context) {
    context.commit(FETCH_CART);
    await graphqlCartClient.clearCart();
    await context.dispatch(FETCH_CART);
  },
  async [CHECKOUT](context, payload: string) {
    context.commit(FETCH_CART);
    //const result = await graphqlCartClient.createOrder(payload);
    await context.dispatch(FETCH_CART);
  },
  [SHOW_CART_SIDEBAR](context) {
    context.commit(SET_SIDEBAR_VISIBLE, true);
  },
  [HIDE_CART_SIDEBAR](context) {
    context.commit(SET_SIDEBAR_VISIBLE, false);
  }
};
