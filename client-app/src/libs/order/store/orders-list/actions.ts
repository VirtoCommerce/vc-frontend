import { ActionTree } from "vuex";
import { OrderSearchCriteria } from "core/api/api-clients";
import { storeName, locale } from "core/constants";
import { orderClient} from "core/services/api-clients.service";
import { RootState } from "store/types";
import { FETCH_ORDERS, FETCH_SELECTED_ORDER, SET_ORDERS_SEARCH_CRITERIA, CLEAR_SELECTED_ORDER, SET_ORDERS, SET_SELECTED_ORDER } from "./definitions";
import { OrdersListState } from "./types";

//actions
export const actions: ActionTree<OrdersListState, RootState> = {
  async [SET_ORDERS_SEARCH_CRITERIA](context , payload: OrderSearchCriteria) {
    context.commit(SET_ORDERS_SEARCH_CRITERIA, payload);
    context.dispatch(FETCH_ORDERS);
  },
  async [FETCH_ORDERS](context) {
    context.commit(FETCH_ORDERS);
    const result = await orderClient.searchCustomerOrders(new OrderSearchCriteria(context.state.searchCriteria), storeName, locale);
    context.commit(SET_ORDERS, result);
  },
  async [FETCH_SELECTED_ORDER](context, payload: string) {
    context.commit(FETCH_SELECTED_ORDER);
    const result = await orderClient.getCustomerOrder(payload, storeName, locale);
    context.commit(SET_SELECTED_ORDER, result);
  },
  [CLEAR_SELECTED_ORDER](context) {
    context.commit(CLEAR_SELECTED_ORDER);
  }
};
