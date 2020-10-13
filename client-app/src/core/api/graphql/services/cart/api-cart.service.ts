import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import {
  IInputAddressType,
  IInputNewCartItemType,
  IInputPaymentType,
  IInputShipmentType,
  IMutations,
  IMutationsAddItemArgs,
  IInputAddItemType,
  IInputChangeCartItemQuantityType,
  IMutationsAddItemsCartArgs,
  IMutationsAddOrUpdateCartAddressArgs,
  IMutationsAddOrUpdateCartPaymentArgs,
  IMutationsAddOrUpdateCartShipmentArgs,
  IMutationsChangeCartItemQuantityArgs,
  IMutationsClearCartArgs,
  IMutationsCreateOrderFromCartArgs,
  IMutationsRemoveCartItemArgs,
  IQuery,
  IQueryCartArgs
} from '../../types';
import AddItem from './mutations/addItem.graphql';
import AddItems from './mutations/addItems.graphql';
import AddOrUpdateCartAddress from './mutations/addOrUpdateCartAddress.graphql';
import AddOrUpdateCartPayment from './mutations/addOrUpdateCartPayment.graphql';
import AddOrUpdateCartShipment from './mutations/addOrUpdateCartShipment.graphql';
import ChangeCartItemQuantity from './mutations/changeCartItemQuantity.graphql';
import ClearCart from './mutations/clearCart.graphql';
import CreateOrderMutation from './mutations/createOrder.graphql';
import RemoveCartItem from './mutations/removeCartItem.graphql';
import CartQuery from './queries/cart.graphql';

export default class ApiCartService {

  constructor(
    private storeId: string,
    private cultureName: string,
    private currencyCode: string,
    private currentUserId: string,
    private client: ApolloClient<NormalizedCacheObject>
  ) {
  }

  async getCart() {
    const { data: { cart } } = await this.client.query<IQuery, IQueryCartArgs>({
      query: CartQuery,
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
    const { data } = await this.client.mutate<IMutations, IMutationsClearCartArgs>({
      mutation: ClearCart,
      variables: {
        command: {
          storeId: this.storeId,
          userId: this.currentUserId
        }
      }
    });

    return data!.clearCart!.itemsCount!;
  }

  async addItemToCart(body: IInputAddItemType) {
    const { data } = await this.client.mutate<IMutations, IMutationsAddItemArgs>({
      mutation: AddItem,
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

  async addItemsToCart(body: IInputNewCartItemType[]) {
    const { data } = await this.client.mutate<IMutations, IMutationsAddItemsCartArgs>({
      mutation: AddItems,
      variables: {
        command: {
          storeId: this.storeId,
          userId: this.currentUserId,
          addCartItems: body
        }
      }
    });

    return data!.addItemsCart!;
  }

  async changeCartItem(body?: IInputChangeCartItemQuantityType) {
    const { data } = await this.client.mutate<IMutations, IMutationsChangeCartItemQuantityArgs>({
      mutation: ChangeCartItemQuantity,
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
    const { data } = await this.client.mutate<IMutations, IMutationsRemoveCartItemArgs>({
      mutation: RemoveCartItem,
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

  async addOrUpdateCartAddress(address: IInputAddressType, cartId?: string) {
    const { data } = await this.client.mutate<IMutations, IMutationsAddOrUpdateCartAddressArgs>({
      mutation: AddOrUpdateCartAddress,
      variables: {
        command: {
          storeId: this.storeId,
          userId: this.currentUserId,
          currency: this.currencyCode,
          language: this.cultureName,
          cartId,
          address
        }
      }
    });

    return data!.addOrUpdateCartAddress!.addresses!;
  }

  async addOrUpdateCartShipment(shipment: IInputShipmentType) {
    const { data } = await this.client.mutate<IMutations, IMutationsAddOrUpdateCartShipmentArgs>({
      mutation: AddOrUpdateCartShipment,
      variables: {
        command: {
          storeId: this.storeId,
          userId: this.currentUserId,
          currency: this.currencyCode,
          language: this.cultureName,
          shipment
        }
      }
    });

    return data!.addOrUpdateCartShipment!;
  }

  async addOrUpdateCartPayment(payment: IInputPaymentType) {
    const { data } = await this.client.mutate<IMutations, IMutationsAddOrUpdateCartPaymentArgs>({
      mutation: AddOrUpdateCartPayment,
      variables: {
        command: {
          storeId: this.storeId,
          userId: this.currentUserId,
          currency: this.currencyCode,
          language: this.cultureName,
          payment
        }
      }
    });

    return data!.addOrUpdateCartPayment!;
  }


  async createOrder(id: string) {
    const { data } = await this.client.mutate<IMutations, IMutationsCreateOrderFromCartArgs>({
      mutation: CreateOrderMutation,
      variables: {
        command: {
          cartId: id
        }
      }
    });

    return data!.createOrderFromCart!.number;
  }

}
