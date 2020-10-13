import { GetterTree } from "vuex";
import { BvTableFieldArray } from 'bootstrap-vue';
import { OrganizationContactsSearchQuery } from 'libs/user/models/types';
import { UsersListState } from "libs/user/store/users-list/types";
import { RootState } from "store/types";
import { ContactType, ContactConnection } from '@core/api/graphql/types';

// getters
export const getters: GetterTree<UsersListState, RootState> = {
  isLoading: (state: UsersListState): boolean => {
    return state.isLoading;
  },
  columns: (state: UsersListState): BvTableFieldArray => {
    return state.columns;
  },
  searchCriteria: (state: UsersListState): OrganizationContactsSearchQuery => {
    return state.searchCriteria;
  },
  users: (state: UsersListState): ContactConnection => {
    return state.users;
  },
  selectedUser: (state: UsersListState): ContactType | null => {
    return state.selectedUser;
  }
};
