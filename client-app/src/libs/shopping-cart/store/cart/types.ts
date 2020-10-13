import {
  CartType  
} from '@core/api/graphql/types';

import { AsyncState } from "@core/models/asyncState";

// state type
export interface CartState extends AsyncState {
  cart: CartType | null;
  cartItemsCount: number;
  sidebarVisible: boolean;
}
