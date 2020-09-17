import { GetterTree } from "vuex";
import { BvTableFieldArray } from 'bootstrap-vue';
import { User, IOrganizationContactsSearchCriteria, IUserSearchResult, IUser } from "core/api/api-clients";
import { UsersListState } from "libs/user/store/users-list/types";
import { RootState } from "store/types";

// getters
export const getters: GetterTree<UsersListState, RootState> = {
  isLoading: (state: UsersListState): boolean => {
    return state.isLoading;
  },
  columns: (state: UsersListState): BvTableFieldArray => {
    return state.columns;
  },
  searchCriteria: (state: UsersListState): IOrganizationContactsSearchCriteria => {
    return state.searchCriteria;
  },
  users: (state: UsersListState): IUserSearchResult => {
    return state.users;
  },
  selectedUser: (state: UsersListState): IUser | null => {
    return state.selectedUser;
  }
};
