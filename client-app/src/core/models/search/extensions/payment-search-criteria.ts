import { PaymentSearchCriteria } from 'core/api/api-clients';
import { PaymentSearchQuery } from 'core/models/search/extensions/payment-search-query';
import { OrderOperationSearchCriteria } from 'core/models/search/order-operation-search-criteria';

declare module '@core/api/api-clients' {
  interface PaymentSearchCriteria extends OrderOperationSearchCriteria {
    toSearchQuery<TSearchQuery extends PaymentSearchQuery>(searchQueryType: new() => TSearchQuery): TSearchQuery;
    normalize(): void;
  }
}

PaymentSearchCriteria.prototype.toSearchQuery = function<TSearchQuery extends PaymentSearchQuery>(searchQueryType: { new(): TSearchQuery }): TSearchQuery {
  const searchQuery = OrderOperationSearchCriteria.prototype.toSearchQuery.apply<PaymentSearchCriteria, { new(): TSearchQuery }[], TSearchQuery>(this, [searchQueryType]);
  return searchQuery;
}

PaymentSearchCriteria.prototype.normalize = function() {
  OrderOperationSearchCriteria.prototype.normalize.apply(this);
}
