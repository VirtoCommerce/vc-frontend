import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import {
  IQuery,
  IQueryOrderArgs
} from '../../types';
import OrderQuery from './queries/order.graphql';


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
    const { data: { order } } = await this.client.query<IQuery, IQueryOrderArgs>({
      query: OrderQuery,
      variables: {
        userId: this.currentUserId,
        number
      }
    });

    return order!;
  }

}
