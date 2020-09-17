import { OrderSearchCriteria } from 'core/api/api-clients';
import { OrderSearchQuery } from 'core/models/search/extensions/order-search-query';
import { OrderOperationSearchCriteria } from 'core/models/search/order-operation-search-criteria';

declare module '@core/api/api-clients' {
  interface OrderSearchCriteria extends OrderOperationSearchCriteria {
    toSearchQuery<TSearchQuery extends OrderSearchQuery>(searchQueryType: new() => TSearchQuery): TSearchQuery;
    normalize(): void;
  }
}

OrderSearchCriteria.prototype.toSearchQuery = function<TSearchQuery extends OrderSearchQuery>(searchQueryType: { new(): TSearchQuery }): TSearchQuery {
  const searchQuery = OrderOperationSearchCriteria.prototype.toSearchQuery.apply<OrderSearchCriteria, { new(): TSearchQuery }[], TSearchQuery>(this, [searchQueryType]);
  return searchQuery;
}

OrderSearchCriteria.prototype.normalize = function() {
  OrderOperationSearchCriteria.prototype.normalize.apply(this);
}
