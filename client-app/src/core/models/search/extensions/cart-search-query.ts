/* eslint-disable-next-line import/default */
import { ICartSearchCriteria } from 'core/api/api-clients';
import 'core/models/search/extensions/cart-search-criteria';
import { KeywordSearchQuery } from 'core/models/search/keyword-search-query';

export class CartSearchQuery extends KeywordSearchQuery {
  toSearchCriteria<TSearchCriteria extends ICartSearchCriteria>(searchCriteriaType: { new(): TSearchCriteria }): TSearchCriteria {
    const searchCriteria = super.toSearchCriteria(searchCriteriaType);
    return searchCriteria;
  }
}
