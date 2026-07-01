import type * as Components from ".";

declare module "vue" {
  // Glboal components is already declated interface which we want to augment
  // eslint-disable-next-line @typescript-eslint/naming-convention
  export interface GlobalComponents {
    VcAddToCart: typeof Components.VcAddToCart;
    VcConfirmationModal: typeof Components.VcConfirmationModal;
    VcDatePicker: typeof Components.VcDatePicker;
    VcModal: typeof Components.VcModal;
    VcPagination: typeof Components.VcPagination;
    VcPopupSidebar: typeof Components.VcPopupSidebar;
    VcProductButton: typeof Components.VcProductButton;
    VcProductCard: typeof Components.VcProductCard;
    VcProductImage: typeof Components.VcProductImage;
    VcQuantityStepper: typeof Components.VcQuantityStepper;
    VcTable: typeof Components.VcTable;
    VcWidget: typeof Components.VcWidget;
    VcWidgetSkeleton: typeof Components.VcWidgetSkeleton;
  }
}

export {};
