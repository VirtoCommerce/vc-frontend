/* eslint-disable-next-line import/default */
import { IOrganizationContactsSearchCriteria } from 'core/api/api-clients';
import 'core/models/search/extensions/organization-contacts-search-criteria';
import { KeywordSearchQuery } from 'core/models/search/keyword-search-query';

export class OrganizationContactsSearchQuery extends KeywordSearchQuery {
  toSearchCriteria<TSearchCriteria extends IOrganizationContactsSearchCriteria>(searchCriteriaType: { new(): TSearchCriteria }): TSearchCriteria {
    const searchCriteria = super.toSearchCriteria(searchCriteriaType);
    return searchCriteria;
  }
}
