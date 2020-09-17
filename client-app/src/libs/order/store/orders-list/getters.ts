import { GetterTree } from "vuex";
import { BvTableFieldArray } from "bootstrap-vue";
import { ICustomerOrderSearchResult, ICustomerOrder, IOrderSearchCriteria } from "core/api/api-clients";
import { RootState } from "store/types";
import { OrdersListState } from "./types";

// getters
export const getters: GetterTree<OrdersListState, RootState> = {
  isLoading: (state: OrdersListState): boolean => {
    return state.isLoading;
  },
  columns: (state: OrdersListState): BvTableFieldArray => {
    return state.columns;
  },
  searchCriteria: (state: OrdersListState): IOrderSearchCriteria => {
    return state.searchCriteria;
  },
  orders: (state: OrdersListState): ICustomerOrderSearchResult => {
    return state.orders;
  },
  selectedOrder: (state: OrdersListState): ICustomerOrder | null => {
    return state.selectedOrder;
  }
};
