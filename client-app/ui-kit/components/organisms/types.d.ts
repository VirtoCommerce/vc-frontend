import type * as Components from ".";

declare module "vue" {
  // Glboal components is already declated interface which we want to augment
  // eslint-disable-next-line @typescript-eslint/naming-convention
  export interface GlobalComponents {
    VcAddToCart: typeof Components.VcAddToCart;
    VcConfirmationModal: typeof Components.VcConfirmationModal;
    VcModal: typeof Components.VcModal;
    VcPagination: typeof Components.VcPagination;
    VcProductImage: typeof Components.VcProductImage;
    VcTable: typeof Components.VcTable;
    TableStatusBadge: typeof Components.TableStatusBadge;
  }
}

export {};
