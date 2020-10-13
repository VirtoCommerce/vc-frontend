import XApiOrderService from 'core/api/graphql/services/order/x-api-order.service';
import XApiUserService from 'core/api/graphql/services/user/x-api-user.service';
import graphqlClient from '../api/graphql/graphql-client';
import XApiCartService from '../api/graphql/services/cart/x-api-cart.service';
import {
  baseUrl,
  currencyCode, currentUserId,
  locale,
  storeName
} from '../constants';

export const graphqlCartClient = new XApiCartService(storeName, locale, currencyCode, currentUserId, graphqlClient);
export const graphqlOrderClient = new XApiOrderService(storeName, locale, currencyCode, currentUserId, graphqlClient);
export const graphqlUserClient = new XApiUserService(storeName, locale, currencyCode, currentUserId, graphqlClient);
