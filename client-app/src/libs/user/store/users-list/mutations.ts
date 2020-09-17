import { MutationTree } from "vuex";
import { UserSearchResult, User, OrganizationContactsSearchCriteria } from 'core/api/api-clients';
import { fetchAsync, setAsync } from '@core/utilities/async-state';
import { FETCH_USERS, CLEAR_SELECTED_USER, SET_USERS_SEARCH_CRITERIA, FETCH_SELECTED_USER, SET_SELECTED_USER, SET_USERS } from "./definitions";
import { UsersListState } from "./types";

//mutations
export const mutations: MutationTree<UsersListState> = {
  [SET_USERS_SEARCH_CRITERIA](state, payload: OrganizationContactsSearchCriteria) {
    state.searchCriteria = payload;
  },
  [FETCH_USERS](state) {
    fetchAsync(state);
  },
  [SET_USERS](state, payload: UserSearchResult) {
    state.users.results = payload.results  || [];
    state.users.totalCount = payload.totalCount || 0;
    setAsync(state);
  },
  [FETCH_SELECTED_USER](state) {
    fetchAsync(state);
  },
  [SET_SELECTED_USER](state, payload: User) {
    state.selectedUser = payload;
    setAsync(state);
  },
  [CLEAR_SELECTED_USER](state) {
    state.selectedUser = null;
  }
};
