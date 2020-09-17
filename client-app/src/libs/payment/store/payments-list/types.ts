import { BvTableFieldArray } from "bootstrap-vue";
import { IPaymentSearchCriteria, IPaymentSearchResult, IPaymentIn } from "core/api/api-clients";
import { AsyncState } from 'core/models/asyncState';

// state type
export interface PaymentsListState extends AsyncState {
  columns: BvTableFieldArray;
  searchCriteria: IPaymentSearchCriteria;
  payments: IPaymentSearchResult;
}
