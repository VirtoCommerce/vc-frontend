import { WishlistType } from "@/xapi/types";

export interface SelectedWishlistType extends WishlistType {
  checked?: boolean;
}

export interface WishlistInputType {
  listName: string;
  errorMessage?: string;
}
