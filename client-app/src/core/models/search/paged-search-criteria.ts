import { PagedSearchQuery } from 'core/models/search/paged-search-query';

/* eslint-disable-next-line @typescript-eslint/interface-name-prefix */
export interface IPagedSearchCriteria {
  pageNumber?: number;
  pageSize?: number;
}

export class PagedSearchCriteria implements IPagedSearchCriteria {
  pageNumber?: number;
  pageSize?: number;

  constructor(data?: IPagedSearchCriteria) {
    if (data === undefined) {
      return;
    }

    for (const property in data) {
      if (data.hasOwnProperty(property)) {
        (this as any)[property] = (data as any)[property];
      }
    }

    this.normalize();
  }

  toSearchQuery<TSearchQuery extends PagedSearchQuery>(searchQueryType: { new(): TSearchQuery }): TSearchQuery {
    const searchQuery = new searchQueryType();
    searchQuery.page = this.pageNumber?.toString();
    /* eslint-disable-next-line @typescript-eslint/camelcase */
    searchQuery.page_size = this.pageSize?.toString();
    return searchQuery;
  }

  normalize() {
    const searchCriteria = this as any;
    for (const key of Object.keys(searchCriteria)) {
      if (searchCriteria[key] === undefined) {
        delete searchCriteria[key];
      }
    }
  }
}
