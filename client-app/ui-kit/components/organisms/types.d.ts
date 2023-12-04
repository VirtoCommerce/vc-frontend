import type * as Components from ".";

declare module "@vue/runtime-core" {
  // Glboal components is already declated interface which we want to augment
  // eslint-disable-next-line @typescript-eslint/naming-convention
  export interface GlobalComponents {
    VcAddToCart: typeof Components.VcAddToCart;
    VcConfirmationDialog: typeof Components.VcConfirmationDialog;
    VcPagination: typeof Components.VcPagination;
    VcPopup: typeof Components.VcPopup;
    VcProductImage: typeof Components.VcProductImage;
    VcTable: typeof Components.VcTable;
    TableStatusBadge: typeof Components.TableStatusBadge;
  }
}
