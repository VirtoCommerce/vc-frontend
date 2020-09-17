import { MutationTree } from "vuex";
import { PaymentSearchResult, PaymentSearchCriteria } from 'core/api/api-clients';
import { InvoicesListState } from "libs/invoice/store/invoices-list/types";
import { fetchAsync, setAsync } from '@core/utilities/async-state';
import { FETCH_INVOICES, SET_INVOICES_SEARCH_CRITERIA, SET_INVOICES } from "./definitions";

//mutations
export const mutations: MutationTree<InvoicesListState> = {
  [SET_INVOICES_SEARCH_CRITERIA](state, payload: PaymentSearchCriteria) {
    state.searchCriteria = payload;
  },
  [FETCH_INVOICES](state) {
    fetchAsync(state);
  },
  [SET_INVOICES](state, payload: PaymentSearchResult) {
    state.invoices.results = payload.results  || [];
    state.invoices.totalCount = payload.totalCount || 0;
    setAsync(state);
  }
};
