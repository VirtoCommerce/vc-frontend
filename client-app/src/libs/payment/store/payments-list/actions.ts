import { ActionTree } from "vuex";
import { PaymentSearchCriteria } from 'core/api/api-clients';
import { storeName, locale } from 'core/constants';
import { orderClient } from 'core/services/api-clients.service';
import { FETCH_PAYMENTS, SET_PAYMENTS_SEARCH_CRITERIA, SET_PAYMENTS } from "libs/payment/store/payments-list/definitions";
import { PaymentsListState } from "libs/payment/store/payments-list/types";
import { RootState } from "store/types";

//actions
export const actions: ActionTree<PaymentsListState, RootState> = {
  async [SET_PAYMENTS_SEARCH_CRITERIA](context , payload: PaymentSearchCriteria) {
    context.commit(SET_PAYMENTS_SEARCH_CRITERIA, payload);
    context.dispatch(FETCH_PAYMENTS);
  },
  async [FETCH_PAYMENTS](context) {
    context.commit(FETCH_PAYMENTS);
    const result = await orderClient.searchPayments(new PaymentSearchCriteria(context.state.searchCriteria), storeName, locale);
    context.commit(SET_PAYMENTS, result);
  }
};
