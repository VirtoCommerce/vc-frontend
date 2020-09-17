import Vue from 'vue';
import { ApiAccountClient, ApiCartClient, ApiCatalogClient, ApiOrderClient, ApiPricingClient, ApiListsClient } from 'core/api/api-clients';
import { baseUrl } from 'core/constants';
import axios from "core/services/axios-instance";

// There is globals instances of api clients fore shared usage.
// Add here new global instance any api client class if you need.
export const accountClient = new ApiAccountClient(baseUrl, axios);
export const catalogClient = new ApiCatalogClient(baseUrl, axios);
export const cartClient = new ApiCartClient(baseUrl, axios);
export const orderClient = new ApiOrderClient(baseUrl, axios);
export const pricingClient = new ApiPricingClient(baseUrl, axios);
export const listClient = new ApiListsClient(baseUrl, axios);
