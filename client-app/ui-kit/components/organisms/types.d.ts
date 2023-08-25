import type * as Components from ".";

declare module "@vue/runtime-core" {
  // Glboal components is already declated interface which we want to augment
  // eslint-disable-next-line @typescript-eslint/naming-convention
  export interface GlobalComponents {
    VcAddOrUpdateAddressModal: typeof Components.VcAddOrUpdateAddressModal;
    VcAddToCart: typeof Components.VcAddToCart;
    VcConfirmationDialog: typeof Components.VcConfirmationDialog;
    VcPopup: typeof Components.VcPopup;
    VcSlidingActions: typeof Components.VcSlidingActions;
    VcTable: typeof Components.VcTable;
    TableStatusBadge: typeof Components.TableStatusBadge;
  }
}
