import { BvTableFieldArray } from "bootstrap-vue";
import { ICartSearchCriteria, IShoppingCart, IShoppingCartSearchResult } from "core/api/api-clients";
import { AsyncState } from "core/models/asyncState";

// state type
export interface DraftsListState extends AsyncState {
  columns: BvTableFieldArray;
  searchCriteria: ICartSearchCriteria;
  drafts: IShoppingCartSearchResult;
  selectedDraft: IShoppingCart | null;
}
