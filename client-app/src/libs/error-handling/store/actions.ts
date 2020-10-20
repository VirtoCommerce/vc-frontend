import { ActionTree } from "vuex";
import { ADD_ERROR, REMOVE_ERROR } from "./definitions";
import { State, ErrorInfo } from "./types";

//actions
export const actions: ActionTree<State, any> = {
  [ADD_ERROR](context, error: ErrorInfo) {
    context.commit(ADD_ERROR, error);
  },
  [REMOVE_ERROR](context, error: ErrorInfo) {
    context.commit(REMOVE_ERROR, error);
  }
};
