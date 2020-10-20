import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import {
  CartQuery,
  CartQueryVariables,
  AddItemMutation,
  AddItemMutationVariables,
  InputAddItemType,
  ClearCartMutation,
  ClearCartMutationVariables,
  ChangeCartItemQuantityMutation,
  ChangeCartItemQuantityMutationVariables,
  InputChangeCartItemQuantityType,
  RemoveCartItemMutation,
  RemoveCartItemMutationVariables
} from '../../types';
import AddItemDocument from './mutations/addItem.graphql';
import ChangeCartItemQtyDocument from './mutations/changeCartItemQuantity.graphql';
import ClearCartDocument from './mutations/clearCart.graphql';
import RemoveCartItemDocument from './mutations/removeCartItem.graphql';
import CartQueryDocument from './queries/cart.graphql';

export default class XApiCartService {

  constructor(
    private storeId: string,
    private cultureName: string,
    private currencyCode: string,
    private currentUserId: string,
    private client: ApolloClient<NormalizedCacheObject>
  ) {
  }

  async getCart() {
    const { data: { cart } } = await this.client.query<CartQuery, CartQueryVariables>({
      query: CartQueryDocument,
      variables: {
        storeId: this.storeId,
        userId: this.currentUserId,
        currencyCode: this.currencyCode,
        cultureName: this.cultureName
      }
    });
    return cart!;
  }

  async clearCart() {
    const { data } = await this.client.mutate<ClearCartMutation, ClearCartMutationVariables>({
      mutation: ClearCartDocument,
      variables: {
        command:
        {
          storeId: this.storeId,
          userId: this.currentUserId
        }
      }
    });

    return data!.clearCart!.itemsCount!;
  }

  async addItemToCart(body: InputAddItemType) {
    const { data } = await this.client.mutate<AddItemMutation, AddItemMutationVariables>({
      mutation: AddItemDocument,
      variables: {
        command: {
          storeId: this.storeId,
          userId: this.currentUserId,
          productId: body.productId,
          quantity: body.quantity,
          price: body.price
        }
      }
    });
    return data?.addItem?.itemsQuantity;
  }


  async changeCartItem(body?: InputChangeCartItemQuantityType) {
    const { data } = await this.client.mutate<ChangeCartItemQuantityMutation, ChangeCartItemQuantityMutationVariables>({
      mutation: ChangeCartItemQtyDocument,
      variables: {
        command: {
          storeId: this.storeId,
          userId: this.currentUserId,
          lineItemId: body?.lineItemId!,
          quantity: body?.quantity!
        }
      }
    });

    return data!.changeCartItemQuantity!.itemsQuantity!;
  }

  async removeCartItem(lineItemId?: string) {
    const { data } = await this.client.mutate<RemoveCartItemMutation, RemoveCartItemMutationVariables>({
      mutation: RemoveCartItemDocument,
      variables: {
        command: {
          storeId: this.storeId,
          userId: this.currentUserId,
          lineItemId: lineItemId!
        }
      }
    });

    return data!.removeCartItem!.itemsCount!;
  }


}
