import { BvTableFieldArray } from "bootstrap-vue";
import { IOrganizationContactsSearchCriteria, IUserSearchResult, IUser } from "core/api/api-clients";
import { AsyncState } from 'core/models/asyncState';

// state type
export interface UsersListState extends AsyncState {
  columns: BvTableFieldArray;
  searchCriteria: IOrganizationContactsSearchCriteria;
  users: IUserSearchResult;
  selectedUser: IUser | null;
}

