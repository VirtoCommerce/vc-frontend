import { BvTableFieldArray } from "bootstrap-vue";
import { IOrderSearchCriteria, ICustomerOrderSearchResult, ICustomerOrder } from "core/api/api-clients";
import { AsyncState } from 'core/models/asyncState';

// state type
export interface OrdersListState extends AsyncState {
  columns: BvTableFieldArray;
  searchCriteria: IOrderSearchCriteria;
  orders: ICustomerOrderSearchResult;
  selectedOrder: ICustomerOrder | null;
}
