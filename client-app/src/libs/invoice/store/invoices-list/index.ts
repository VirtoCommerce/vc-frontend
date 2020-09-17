import { Module } from "vuex";
import { defaultPageSize, invoicesGridFields, startPageNumber } from 'core/constants';
import { localizeGridColumns } from 'core/services/localization.helper.service';
import { RootState } from "store/types";
import { actions } from "./actions";
import { getters } from "./getters";
import { mutations } from "./mutations";
import { InvoicesListState } from "./types";

// initial state
export const initialState: InvoicesListState = {
  isLoading: false,
  loaded: false,
  errors: null,
  columns: invoicesGridFields,
  searchCriteria: {
    pageNumber: startPageNumber,
    pageSize: defaultPageSize,
    statuses: []
  },
  invoices: {
    totalCount: 0,
    results: []
  }
};

// We need this because bootstrap-vue will directly use labels on stacked table
initialState.columns = localizeGridColumns("account.invoices.grid.columns", initialState.columns);

const invoicesListModule: Module<InvoicesListState, RootState> = {
  namespaced: true,
  state: initialState,
  getters,
  actions,
  mutations
};

export default invoicesListModule;
