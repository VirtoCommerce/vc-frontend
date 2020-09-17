import { ActionTree } from "vuex";
import { ADD_ERROR, REMOVE_ERROR } from "pages/init/store/definitions";
import { State } from "@init-app/store/state";
import ErrorInfo from "@init-app/store/types";

//actions
export const actions: ActionTree<State, State> = {
  [ADD_ERROR](context, error: ErrorInfo) {
    context.commit(ADD_ERROR, error);
  },
  [REMOVE_ERROR](context, error: ErrorInfo) {
    context.commit(REMOVE_ERROR, error);
  }
};
