/* eslint-disable-next-line import/default */
import moment from 'moment';
import { KeywordSearchQuery } from 'core/models/search/keyword-search-query';
import { IOrderOperationSearchCriteria } from 'core/models/search/order-operation-search-criteria';
/* eslint-disable-next-line import/default */
import { safeInvoke } from '@core/utilities/utilities';

export class OrderOperationSearchQuery extends KeywordSearchQuery {
  startDate?: string;
  endDate?: string;
  statuses?: string;
  sort?: string;

  toSearchCriteria<TSearchCriteria extends IOrderOperationSearchCriteria>(searchCriteriaType: { new(): TSearchCriteria }): TSearchCriteria {
    const searchCriteria = super.toSearchCriteria(searchCriteriaType);
    searchCriteria.sort = this.sort;
    searchCriteria.startDate = safeInvoke(this.startDate, startDate => moment(startDate).toDate());
    searchCriteria.endDate = safeInvoke(this.endDate, endDate => moment(endDate).add(1, "days").subtract(1, "seconds").toDate());
    searchCriteria.statuses = this.statuses?.split(",") || [];
    return searchCriteria;
  }
}
