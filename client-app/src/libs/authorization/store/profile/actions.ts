import { ActionTree } from "vuex";
import { graphqlUserClient } from "core/services/api-clients.service";
import { UserType } from '@core/api/graphql/types';
import { FETCH_PROFILE, SET_PROFILE, UPDATE_USER  } from "./definitions";
import { ProfileState } from "./types";

//actions
export const actions: ActionTree<ProfileState, any> = {
  async [FETCH_PROFILE](context) {
    try {
      context.commit(FETCH_PROFILE);
      const user = await graphqlUserClient.getCurrentUser();
      context.commit(SET_PROFILE, user);
      return user;
    } catch (e) {
      // #todo SET_ERROR cannot work in multiple states
      // context.commit(SET_ERROR, response.data.errors)
    }
  },
  async [UPDATE_USER](context , userUpdateInfo: any) {
    //await accountClient.updateAccount(userUpdateInfo, storeName, locale);
    context.dispatch(FETCH_PROFILE);
  }
};
