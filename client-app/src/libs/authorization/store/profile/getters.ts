import { GetterTree } from "vuex";
import { ProfileState } from "./types";

// getters
export const getters: GetterTree<ProfileState,any> = {
  profile: (state: ProfileState) => {
    return state.profile;
  },
  isLoading: (state: ProfileState): boolean => {
    return state.isLoading;
  }
};
