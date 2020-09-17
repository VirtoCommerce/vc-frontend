import { Module } from "vuex";
import { defaultPageSize, usersGridFields, startPageNumber } from "core/constants";
import { localizeGridColumns } from "core/services/localization.helper.service";
import { RootState } from "store/types";
import { actions } from "./actions";
import { getters } from "./getters";
import { mutations } from "./mutations";
import { UsersListState } from "./types";

// initial state
export const initialState: UsersListState = {
  isLoading: false,
  loaded: false,
  errors: null,
  columns: usersGridFields,
  searchCriteria: {
    pageNumber: startPageNumber,
    pageSize: defaultPageSize
  },
  users: {
    totalCount: 0,
    results: []
  },
  selectedUser: null
};

// We need this because bootstrap-vue will directly use labels on stacked table
initialState.columns = localizeGridColumns("account.users.grid.columns", initialState.columns);

const ordersListModule: Module<UsersListState, RootState> = {
  namespaced: true,
  state: initialState,
  getters,
  actions,
  mutations
};

export default ordersListModule;

