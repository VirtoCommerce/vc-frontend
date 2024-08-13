import type * as Components from ".";

declare module "vue" {
  // Glboal components is already declated interface which we want to augment
  // eslint-disable-next-line @typescript-eslint/naming-convention
  export interface GlobalComponents {
    // @deprecated
    // FIXME: https://virtocommerce.atlassian.net/browse/VCST-1657
    VcAddToCart: typeof Components.VcAddToCart;
    VcConfirmationModal: typeof Components.VcConfirmationModal;
    VcModal: typeof Components.VcModal;
    VcPushMessage: typeof Components.VcPushMessage;
    VcPushMessages: typeof Components.VcPushMessages;
    VcPagination: typeof Components.VcPagination;
    VcProductImage: typeof Components.VcProductImage;
    VcTable: typeof Components.VcTable;
    TableStatusBadge: typeof Components.TableStatusBadge;
  }
}

export {};
