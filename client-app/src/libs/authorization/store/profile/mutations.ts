import { MutationTree } from "vuex";
import { FETCH_PROFILE, SET_PROFILE } from "./definitions";
import { ProfileState } from "./types";

//mutations
export const mutations: MutationTree<ProfileState> = {
  // [SET_ERROR] (state, error) {
  //   state.errors = error
  // },
  [SET_PROFILE](state, profile) {
    state.profile = profile;
    state.loaded = true;
    state.isLoading = false;
    state.errors = {};
  },
  [FETCH_PROFILE](state) {
    state.isLoading = true;
    state.loaded = false;
  }
};
