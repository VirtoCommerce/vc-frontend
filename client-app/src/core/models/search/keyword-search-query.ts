import { IKeywordSearchCriteria } from 'core/models/search/keyword-search-criteria';
import { PagedSearchQuery } from 'core/models/search/paged-search-query';

/* eslint @typescript-eslint/camelcase: ["error", {properties: "never"}] */
export class KeywordSearchQuery extends PagedSearchQuery {
  page?: string;
  page_size?: string;
  q?: string;
  keyword?: string;

  toSearchCriteria<TSearchCriteria extends IKeywordSearchCriteria>(searchCriteriaType: { new(): TSearchCriteria }): TSearchCriteria {
    const searchCriteria = super.toSearchCriteria(searchCriteriaType);
    searchCriteria.keyword = this.q || this.keyword;
    return searchCriteria;
  }
}
