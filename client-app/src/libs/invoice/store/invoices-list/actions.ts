import { ActionTree } from "vuex";
import { PaymentSearchCriteria } from 'core/api/api-clients';
import { storeName, locale } from 'core/constants';
import { orderClient } from 'core/services/api-clients.service';
import { FETCH_INVOICES, SET_INVOICES_SEARCH_CRITERIA, SET_INVOICES } from "libs/invoice/store/invoices-list/definitions";
import { InvoicesListState } from "libs/invoice/store/invoices-list/types";
import { RootState } from "store/types";

//actions
export const actions: ActionTree<InvoicesListState, RootState> = {
  async [SET_INVOICES_SEARCH_CRITERIA](context , payload: PaymentSearchCriteria) {
    context.commit(SET_INVOICES_SEARCH_CRITERIA, payload);
    context.dispatch(FETCH_INVOICES);
  },
  async [FETCH_INVOICES](context) {
    context.commit(FETCH_INVOICES);
    const result = await orderClient.searchPayments(new PaymentSearchCriteria(context.state.searchCriteria), storeName, locale);
    context.commit(SET_INVOICES, result);
  }
};
