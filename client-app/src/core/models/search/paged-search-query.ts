import { IPagedSearchCriteria } from 'core/models/search/paged-search-criteria';
import { safeInvoke } from '@core/utilities/utilities';

/* eslint @typescript-eslint/camelcase: ["error", {properties: "never"}] */
export class PagedSearchQuery {
  page?: string;
  page_size?: string;

  toSearchCriteria<TSearchCriteria extends IPagedSearchCriteria>(searchCriteriaType: { new(): TSearchCriteria }): TSearchCriteria {
    const searchCriteria = new searchCriteriaType();
    searchCriteria.pageNumber = safeInvoke(this.page, page => Number(page));
    searchCriteria.pageSize = safeInvoke(this.page_size, pageSize => Number(pageSize));
    return searchCriteria;
  }
}
