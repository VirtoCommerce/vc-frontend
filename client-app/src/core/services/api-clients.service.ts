import ApiOrderService from 'core/api/graphql/services/order/api-order.service';
import {
  ApiAccountClient,
  ApiCartClient,
  ApiCatalogClient,
  ApiOrderClient,
  ApiPricingClient,
  ApiListsClient,
  ApiCommonClient
} from '../api/api-clients';
import graphqlClient from '../api/graphql/graphql-client';
import ApiCartService from '../api/graphql/services/cart/api-cart.service';
import {
  baseUrl,
  currencyCode, currentUserId,
  locale,
  storeName
} from '../constants';
import axios from './axios-instance';

// There is globals instances of api clients fore shared usage.
// Add here new global instance any api client class if you need.
export const commonClient = new ApiCommonClient(baseUrl, axios);
export const accountClient = new ApiAccountClient(baseUrl, axios);
export const catalogClient = new ApiCatalogClient(baseUrl, axios);
export const cartClient = new ApiCartClient(baseUrl, axios);
export const orderClient = new ApiOrderClient(baseUrl, axios);
export const pricingClient = new ApiPricingClient(baseUrl, axios);
export const listClient = new ApiListsClient(baseUrl, axios);

export const graphqlCartClient = new ApiCartService(storeName, locale, currencyCode, currentUserId, graphqlClient);
export const graphqlOrderClient = new ApiOrderService(storeName, locale, currencyCode, currentUserId, graphqlClient);
