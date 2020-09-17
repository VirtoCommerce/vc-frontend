import { ActionTree } from "vuex";
import { OrganizationContactsSearchCriteria, OrganizationUserRegistration, UserUpdateInfo } from 'core/api/api-clients';
import { storeName, locale } from 'core/constants';
import { accountClient} from 'core/services/api-clients.service';
import { FETCH_USERS, ADD_USER, DELETE_USER, UPDATE_USER, SET_USERS_SEARCH_CRITERIA, FETCH_SELECTED_USER, CLEAR_SELECTED_USER, SET_USERS, SET_SELECTED_USER, SUSPEND_USER, UNSUSPEND_USER } from "libs/user/store/users-list/definitions";
import { UsersListState } from "libs/user/store/users-list/types";
import { RootState } from "store/types";

//actions
export const actions: ActionTree<UsersListState, RootState> = {
  async [SET_USERS_SEARCH_CRITERIA](context , payload: OrganizationContactsSearchCriteria) {
    context.commit(SET_USERS_SEARCH_CRITERIA, payload);
    context.dispatch(FETCH_USERS);
  },
  async [FETCH_USERS](context) {
    context.commit(FETCH_USERS);
    const result = await accountClient.searchOrganizationUsers(new OrganizationContactsSearchCriteria(context.state.searchCriteria), storeName, locale);
    context.commit(SET_USERS, result);
  },
  async [FETCH_SELECTED_USER](context, payload: string) {
    context.commit(FETCH_SELECTED_USER);
    const result = await accountClient.getUserById(payload, storeName, locale);
    context.commit(SET_SELECTED_USER, result);
  },
  [CLEAR_SELECTED_USER](context) {
    context.commit(CLEAR_SELECTED_USER);
  },
  async [ADD_USER](context, payload: OrganizationUserRegistration) {
    context.commit(FETCH_USERS);
    await accountClient.registerUser(payload, storeName, locale);
    context.dispatch(FETCH_USERS);
  },
  async [DELETE_USER](context, payload: string) {
    await accountClient.deleteUser(payload, storeName, locale);
    context.dispatch(FETCH_USERS);
  },
  async [UPDATE_USER](context, payload: UserUpdateInfo) {
    context.commit(FETCH_USERS);
    await accountClient.updateAccount(payload, storeName, locale);
    context.dispatch(FETCH_USERS);
  },
  async [SUSPEND_USER](context, payload: string) {
    context.commit(FETCH_USERS);
    await accountClient.lockUser(payload, storeName, locale);
    context.dispatch(FETCH_USERS);
  },
  async [UNSUSPEND_USER](context, payload: string) {
    context.commit(FETCH_USERS);
    await accountClient.unlockUser(payload, storeName, locale);
    context.dispatch(FETCH_USERS);
  }

};
