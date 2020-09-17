import { MutationTree } from "vuex";
import { PaymentSearchResult, PaymentSearchCriteria } from 'core/api/api-clients';
import { FETCH_PAYMENTS, SET_PAYMENTS_SEARCH_CRITERIA, SET_PAYMENTS } from "libs/payment/store/payments-list/definitions";
import { PaymentsListState } from "libs/payment/store/payments-list/types";
import { fetchAsync, setAsync } from '@core/utilities/async-state';

//mutations
export const mutations: MutationTree<PaymentsListState> = {
  [SET_PAYMENTS_SEARCH_CRITERIA](state, payload: PaymentSearchCriteria) {
    state.searchCriteria = payload;
  },
  [FETCH_PAYMENTS](state) {
    fetchAsync(state);
  },
  [SET_PAYMENTS](state, payload: PaymentSearchResult) {
    state.payments.results = payload.results  || [];
    state.payments.totalCount = payload.totalCount || 0;
    setAsync(state);
  }
};
