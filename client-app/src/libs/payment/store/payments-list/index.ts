import { Module } from "vuex";
import { defaultPageSize, paymentsGridFields, paymentsStatuses, startPageNumber } from "core/constants";
import { localizeGridColumns } from "core/services/localization.helper.service";
import { RootState } from "store/types";
import { actions } from "./actions";
import { getters } from "./getters";
import { mutations } from "./mutations";
import { PaymentsListState } from "./types";

// initial state
export const initialState: PaymentsListState = {
  isLoading: false,
  loaded: false,
  errors: null,
  columns: paymentsGridFields,
  searchCriteria: {
    pageNumber: startPageNumber,
    pageSize: defaultPageSize,
    statuses: []
  },
  payments: {
    totalCount: 0,
    results: []
  }
};

// We need this because bootstrap-vue will directly use labels on stacked table
initialState.columns = localizeGridColumns("account.payments.grid.columns", initialState.columns);

const paymentsListModule: Module<PaymentsListState, RootState> = {
  namespaced: true,
  state: initialState,
  getters,
  actions,
  mutations
};

export default paymentsListModule;
