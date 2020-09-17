import { IProductSearchCriteria } from 'core/api/api-clients';
import { KeywordSearchQuery } from 'core/models/search/keyword-search-query';
import 'core/models/search/extensions/product-search-criteria';
import { TermsData } from 'core/models/search/terms-data';

/* eslint @typescript-eslint/camelcase: ["error", {properties: "never"}] */
export class ProductSearchQuery extends KeywordSearchQuery {
  sort_by?: string;
  terms?: string;

  toSearchCriteria<TSearchCriteria extends IProductSearchCriteria>(searchCriteriaType: { new(): TSearchCriteria }): TSearchCriteria {
    const searchCriteria = super.toSearchCriteria(searchCriteriaType);
    searchCriteria.sortBy = this.sort_by;
    searchCriteria.termsData = new TermsData().deserialize(this.terms);
    return searchCriteria;
  }
}
