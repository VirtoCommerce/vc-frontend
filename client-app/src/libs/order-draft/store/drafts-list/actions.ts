import { ActionTree } from "vuex";
import { CartSearchCriteria, IShoppingCart, ChangeCartItemQty, AddCartItem } from "core/api/api-clients";
import { storeName, locale, orderDraftType } from "core/constants";
import { listClient, cartClient } from "core/services/api-clients.service";
import { RootState } from "store/types";
import { FETCH_DRAFTS, SET_DRAFTS_SEARCH_CRITERIA, ADD_DRAFT, SET_DRAFTS, DELETE_DRAFT, SET_SELECTED_DRAFT, DELETE_ITEM_FROM_DRAFT, CHANGE_DRAFT_ITEM_QUANTITY, ADD_ITEM_TO_DRAFT, CLEAR_SELECTED_DRAFT, CHECKOUT } from "./definitions";
import { DraftsListState } from "./types";


//actions
export const actions: ActionTree<DraftsListState, RootState> = {
  async [SET_DRAFTS_SEARCH_CRITERIA](context , payload: CartSearchCriteria) {
    context.commit(SET_DRAFTS_SEARCH_CRITERIA, payload);
    context.dispatch(FETCH_DRAFTS);
  },
  async [FETCH_DRAFTS](context) {
    context.commit(FETCH_DRAFTS);
    const result = await listClient.searchLists(new CartSearchCriteria(context.state.searchCriteria), storeName, locale);
    context.commit(SET_DRAFTS, result);
  },
  [SET_SELECTED_DRAFT](context, payload: IShoppingCart) {
    context.commit(SET_SELECTED_DRAFT, payload);
  },
  async [CLEAR_SELECTED_DRAFT](context, {name, type}: {name: string; type: string}) {
    context.commit(FETCH_DRAFTS);
    await listClient.clearList(name, type, storeName, locale);
    await listClient.getListByName(name, type, storeName, locale).then(list => {
      context.dispatch(SET_SELECTED_DRAFT, list);
    });
    context.dispatch(FETCH_DRAFTS);
  },
  async [ADD_DRAFT](context, payload: string) {
    context.commit(FETCH_DRAFTS);
    await listClient.createList(payload, orderDraftType, storeName, locale);
    context.dispatch(FETCH_DRAFTS);
  },
  async [DELETE_DRAFT](context, payload: string[]) {
    await listClient.deleteListsByIds(payload, storeName, locale);
    context.dispatch(FETCH_DRAFTS);
  },
  async [ADD_ITEM_TO_DRAFT](context, addCartItem: AddCartItem ){
    context.commit(FETCH_DRAFTS);
    await listClient.addItemToList(addCartItem, storeName, locale);
    context.dispatch(FETCH_DRAFTS);
  },
  async [CHANGE_DRAFT_ITEM_QUANTITY](context, { listName, changeQty }: { listName: string; changeQty: ChangeCartItemQty | null }) {
    context.commit(FETCH_DRAFTS);
    await listClient.changeListItem(listName, orderDraftType, changeQty, storeName, locale);
    await listClient.getListByName(listName, orderDraftType, storeName, locale).then(list => {
      context.dispatch(SET_SELECTED_DRAFT, list);
    });
    context.dispatch(FETCH_DRAFTS);
  },
  async [DELETE_ITEM_FROM_DRAFT](context, { lineItemId, listName }: { lineItemId: string; listName: string }) {
    context.commit(FETCH_DRAFTS);
    await listClient.removeItemFromList(lineItemId, listName, orderDraftType, storeName, locale);
    await listClient.getListByName(listName, orderDraftType, storeName, locale).then(list => {
      context.dispatch(SET_SELECTED_DRAFT, list);
    });
    context.dispatch(FETCH_DRAFTS);
  },
  async [CHECKOUT](context, payload: string) {
    context.commit(FETCH_DRAFTS);
    await cartClient.createOrderFromNamedCart(payload, orderDraftType, null, false, storeName, locale);
    context.dispatch(FETCH_DRAFTS);
  }
};
