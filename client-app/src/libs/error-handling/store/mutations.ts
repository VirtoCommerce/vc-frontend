import { MutationTree } from "vuex";
import { ADD_ERROR, REMOVE_ERROR } from './definitions';
import { ErrorInfo,  State } from "./types";


//mutations
export const mutations: MutationTree<State> = {
  [ADD_ERROR](state, error: ErrorInfo) {
    state.errors.push(error);
  },
  [REMOVE_ERROR](state, error: ErrorInfo) {
    state.errors.splice(state.errors.indexOf(error));
  }
};
