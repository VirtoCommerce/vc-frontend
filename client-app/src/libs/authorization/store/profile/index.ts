import { Module } from "vuex";
import { UserType } from "@core/api/graphql/types";
import { actions } from "./actions";
import { getters } from "./getters";
import { mutations } from "./mutations";
import { ProfileState } from "./types";

// initial state
export const initialState: ProfileState = {
  errors: {},
  profile: {} as UserType,
  isLoading: false,
  loaded: false
};

const profileModule: Module<ProfileState, any> = {
  namespaced: true,
  state: initialState,
  getters,
  actions,
  mutations
};

export default profileModule;
