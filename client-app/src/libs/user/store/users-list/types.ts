import { BvTableFieldArray } from "bootstrap-vue";
import { AsyncState } from 'core/models/asyncState';
import { ContactType, ContactConnection } from '@core/api/graphql/types';
import { OrganizationContactsSearchQuery } from 'libs/user/models/types';

// state type
export interface UsersListState extends AsyncState {
  columns: BvTableFieldArray;
  searchCriteria: OrganizationContactsSearchQuery;
  users: ContactConnection;
  selectedUser: ContactType | null;
}

