import Vue from "vue";
import Vuex, { Store, StoreOptions } from "vuex";
import { RootState } from './types';


const debug = process.env.NODE_ENV !== "production";

Vue.use(Vuex);

const store: StoreOptions<RootState> = {
  state: {},
  strict: debug
};

export default new Store<RootState>(store);
