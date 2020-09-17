/* eslint-disable-next-line import/default */
import { IPaymentSearchCriteria } from 'core/api/api-clients';
import 'core/models/search/extensions/payment-search-criteria';
import { OrderOperationSearchQuery } from 'core/models/search/order-operation-search-query';

export class PaymentSearchQuery extends OrderOperationSearchQuery {
  toSearchCriteria<TSearchCriteria extends IPaymentSearchCriteria>(searchCriteriaType: { new(): TSearchCriteria }): TSearchCriteria {
    return super.toSearchCriteria(searchCriteriaType);
  }
}
