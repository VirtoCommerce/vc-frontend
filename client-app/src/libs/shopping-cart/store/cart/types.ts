import { BvTableFieldArray } from "bootstrap-vue";
import { ShoppingCart } from "core/api/api-clients";
import { AsyncState } from "@core/models/asyncState";

// state type
export interface CartState extends AsyncState {
  cart: ShoppingCart | null;
  cartItemsCount: number;
  sidebarVisible: boolean;
  changeProductIdSet: string[];
}
