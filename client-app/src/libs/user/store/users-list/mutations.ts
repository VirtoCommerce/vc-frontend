import { MutationTree } from "vuex";
import { OrganizationContactsSearchQuery } from 'libs/user/models/types';
import { ContactType, ContactConnection } from '@core/api/graphql/types';
import { fetchAsync, setAsync } from '@core/utilities/async-state';
import { FETCH_USERS, CLEAR_SELECTED_USER, SET_USERS_SEARCH_CRITERIA, FETCH_SELECTED_USER, SET_SELECTED_USER, SET_USERS } from "./definitions";
import { UsersListState } from "./types";

//mutations
export const mutations: MutationTree<UsersListState> = {
  [SET_USERS_SEARCH_CRITERIA](state, payload: OrganizationContactsSearchQuery) {
    state.searchCriteria = payload;
  },
  [FETCH_USERS](state) {
    fetchAsync(state);
  },
  [SET_USERS](state, payload: ContactConnection) {
    state.users = payload  || [];
    setAsync(state);
  },
  [FETCH_SELECTED_USER](state) {
    fetchAsync(state);
  },
  [SET_SELECTED_USER](state, payload: ContactType) {
    state.selectedUser = payload;
    setAsync(state);
  },
  [CLEAR_SELECTED_USER](state) {
    state.selectedUser = null;
  }
};
