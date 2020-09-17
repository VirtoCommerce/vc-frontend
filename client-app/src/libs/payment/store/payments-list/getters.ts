import { GetterTree } from "vuex";
import { BvTableFieldArray } from 'bootstrap-vue';
import { IPaymentSearchCriteria, IPaymentSearchResult } from 'core/api/api-clients';
import { PaymentsListState } from "libs/payment/store/payments-list/types";
import { RootState } from "store/types";

// getters
export const getters: GetterTree<PaymentsListState, RootState> = {
  isLoading: (state: PaymentsListState): boolean => {
    return state.isLoading;
  },
  columns: (state: PaymentsListState): BvTableFieldArray => {
    return state.columns;
  },
  searchCriteria: (state: PaymentsListState): IPaymentSearchCriteria => {
    return state.searchCriteria;
  },
  payments: (state: PaymentsListState): IPaymentSearchResult => {
    return state.payments;
  }
};
