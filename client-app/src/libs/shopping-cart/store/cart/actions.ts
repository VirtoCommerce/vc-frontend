import { ActionTree } from "vuex";
import { graphqlCartClient } from 'core/services/api-clients.service';
import { AddCartItem, ChangeCartItemQty } from 'libs/shopping-cart/models/types';
import { findProductInCartByLineItemId } from "libs/shopping-cart/store/cart/helpers";
import { RootState } from 'store/types';
import {
  IInputAddItemType,
  IInputChangeCartItemQuantityType
} from '@core/api/graphql/types';
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
} from './definitions';
import {
  SET_CART,
  SET_CART_ITEMS_COUNT,
  SET_SIDEBAR_VISIBLE,
  ADD_PRODUCT_TO_CHANGE_SET,
  REMOVE_PRODUCT_FROM_CHANGE_SET
} from './mutations';
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

  async [ADD_ITEM_TO_CART](context , payload: AddCartItem) {
    context.commit(FETCH_CART);
    context.commit(ADD_PRODUCT_TO_CHANGE_SET, payload.productId);
    const result = await graphqlCartClient.addItemToCart(payload as IInputAddItemType);
    context.commit(REMOVE_PRODUCT_FROM_CHANGE_SET, payload.productId);
    context.commit(SET_CART_ITEMS_COUNT, result);
    await context.dispatch(FETCH_CART);
  },
  async [CHANGE_ITEM_QUANTITY](context , payload: ChangeCartItemQty) {
    context.commit(FETCH_CART);
    const product = findProductInCartByLineItemId(context.state.cart!, payload.lineItemId!);
    context.commit(ADD_PRODUCT_TO_CHANGE_SET, product.id);
    await graphqlCartClient.changeCartItem(payload as IInputChangeCartItemQuantityType);
    context.commit(REMOVE_PRODUCT_FROM_CHANGE_SET, product.id);
    await context.dispatch(FETCH_CART);
  },
  async [DELETE_ITEM_FROM_CART](context, payload: string) {
    context.commit(FETCH_CART);
    const product = findProductInCartByLineItemId(context.state.cart!, payload);
    context.commit(ADD_PRODUCT_TO_CHANGE_SET, product.id);
    await graphqlCartClient.removeCartItem(payload);
    context.commit(REMOVE_PRODUCT_FROM_CHANGE_SET, product.id);
    await context.dispatch(FETCH_CART);
  },
  async [CLEAR_CART](context) {
    context.commit(FETCH_CART);
    await graphqlCartClient.clearCart();
    await context.dispatch(FETCH_CART);
  },
  async [CHECKOUT](context, payload: string) {
    context.commit(FETCH_CART);
    const result = await graphqlCartClient.createOrder(payload);
    await context.dispatch(FETCH_CART);
  },
  [SHOW_CART_SIDEBAR](context){
    context.commit(SET_SIDEBAR_VISIBLE, true);
  },
  [HIDE_CART_SIDEBAR](context){
    context.commit(SET_SIDEBAR_VISIBLE, false);
  }
};
