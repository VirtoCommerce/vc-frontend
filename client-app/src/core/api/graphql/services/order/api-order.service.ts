import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import {
  OrderQuery,
  OrderQueryVariables
} from '../../types';
import OrderQueryDocument from './queries/order.graphql';


export default class ApiOrderService {

  constructor(
    private storeId: string,
    private cultureName: string,
    private currencyCode: string,
    private currentUserId: string,
    private client: ApolloClient<NormalizedCacheObject>
  ) {
  }

  async getOrder(number: string) {
    const { data: { order } } = await this.client.query<OrderQuery, OrderQueryVariables>({
      query: OrderQueryDocument,
      variables: {
        userId: this.currentUserId,
        number
      }
    });

    return order!;
  }

}
