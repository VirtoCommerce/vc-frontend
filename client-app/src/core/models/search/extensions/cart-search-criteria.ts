import { CartSearchCriteria } from 'core/api/api-clients';
import { CartSearchQuery } from 'core/models/search/extensions/cart-search-query';
import { KeywordSearchCriteria } from 'core/models/search/keyword-search-criteria';

declare module '@core/api/api-clients' {
  interface CartSearchCriteria extends KeywordSearchCriteria {
    keyword?: string;
    toSearchQuery<TSearchQuery extends CartSearchQuery>(searchQueryType: new() => TSearchQuery): TSearchQuery;
    normalize(): void;
  }
}

Object.defineProperty(CartSearchCriteria.prototype, "name", {
  get: function () { return this.keyword; },
  set: function () { this.keyword; }
});

CartSearchCriteria.prototype.toSearchQuery = function<TSearchQuery extends CartSearchQuery>(searchQueryType: { new(): TSearchQuery }): TSearchQuery {
  const searchQuery = KeywordSearchCriteria.prototype.toSearchQuery.apply<CartSearchCriteria, { new(): TSearchQuery }[], TSearchQuery>(this, [searchQueryType]);
  return searchQuery;
}

CartSearchCriteria.prototype.normalize = function() {
  KeywordSearchCriteria.prototype.normalize.apply(this);
}
