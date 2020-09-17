import { Module } from "vuex";
import { ordersGridFields, startPageNumber, defaultPageSize } from 'core/constants';
import { localizeGridColumns } from 'core/services/localization.helper.service';
import { RootState } from "store/types";
import { actions } from "./actions";
import { getters } from "./getters";
import { mutations } from "./mutations";
import { OrdersListState } from "./types";

// initial state
export const initialState: OrdersListState = {
  isLoading: false,
  loaded: false,
  errors: null,
  columns: ordersGridFields,
  searchCriteria: {
    pageNumber: startPageNumber,
    pageSize: defaultPageSize,
    statuses: []
  },
  orders: {
    totalCount: 0,
    results: []
  },
  selectedOrder: null
};

// We need this because bootstrap-vue will directly use labels on stacked table
initialState.columns = localizeGridColumns("account.orders.grid.columns", initialState.columns);

const ordersListModule: Module<OrdersListState, RootState> = {
  namespaced: true,
  state: initialState,
  getters,
  actions,
  mutations
};

export default ordersListModule;
