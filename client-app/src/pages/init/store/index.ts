import Vue from "vue";
import Vuex, { Store, StoreOptions } from "vuex";
import { actions } from "@init-app/store/actions";
import { getters } from "@init-app/store/getters";
import { mutations } from "@init-app/store/mutations";
import { state, State } from "@init-app/store/state";

const debug = process.env.NODE_ENV !== "production";

Vue.use(Vuex);

const store: StoreOptions<State>  = {
  state,
  getters,
  actions,
  mutations
};

export default new Store<State>(store);
