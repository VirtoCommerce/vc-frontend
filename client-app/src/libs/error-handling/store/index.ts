import { Module  } from "vuex";
import { actions } from "./actions";
import { getters } from "./getters";
import { mutations } from "./mutations";
import {  State } from "./types";

// initial state
export const initialState: State = {
  errors:[]
};

const errorHandlingModule: Module<State, any> = {
  namespaced: true,
  state: initialState,
  getters,
  actions,
  mutations
};

export default errorHandlingModule;
