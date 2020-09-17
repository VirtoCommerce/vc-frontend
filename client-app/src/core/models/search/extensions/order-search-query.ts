/* eslint-disable-next-line import/default */
import { IOrderSearchCriteria } from 'core/api/api-clients';
import 'core/models/search/extensions/order-search-criteria';
import { OrderOperationSearchQuery } from 'core/models/search/order-operation-search-query';

export class OrderSearchQuery extends OrderOperationSearchQuery {
  toSearchCriteria<TSearchCriteria extends IOrderSearchCriteria>(searchCriteriaType: { new(): TSearchCriteria }): TSearchCriteria {
    const searchCriteria = super.toSearchCriteria(searchCriteriaType);
    return searchCriteria;
  }
}
