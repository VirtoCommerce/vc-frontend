import type * as Components from ".";

declare module "@vue/runtime-core" {
  // Glboal components is already declated interface which we want to augment
  // eslint-disable-next-line @typescript-eslint/naming-convention
  export interface GlobalComponents {
    VcAddressInfo: typeof Components.VcAddressInfo;
    VcAddressForm: typeof Components.VcAddressForm;
    VcAddressSelection: typeof Components.VcAddressSelection;
    VcAlert: typeof Components.VcAlert;
    VcButton: typeof Components.VcButton;
    VcButtonSeeMoreLess: typeof Components.VcButtonSeeMoreLess;
    VcCarousel: typeof Components.VcCarousel;
    VcChip: typeof Components.VcChip;
    VcCollapsibleContent: typeof Components.VcCollapsibleContent;
    VcCopyText: typeof Components.VcCopyText;
    VcDropdownMenu: typeof Components.VcDropdownMenu;
    VcEmptyPage: typeof Components.VcEmptyPage;
    VcExpansionPanel: typeof Components.VcExpansionPanel;
    /** @deprecated use Swiper instead. */
    VcImageGallery: typeof Components.VcImageGallery;
    VcInput: typeof Components.VcInput;
    VcItemPrice: typeof Components.VcItemPrice;
    VcItemPriceCatalog: typeof Components.VcItemPriceCatalog;
    VcLineItem: typeof Components.VcLineItem;
    VcLineItems: typeof Components.VcLineItems;
    VcLineItemPrice: typeof Components.VcLineItemPrice;
    VcLineItemTotal: typeof Components.VcLineItemTotal;
    VcList: typeof Components.VcList;
    VcLoaderOverlay: typeof Components.VcLoaderOverlay;
    VcLoaderWithText: typeof Components.VcLoaderWithText;
    VcLayoutWithRightSidebar: typeof Components.VcLayoutWithRightSidebar;
    VcMenuItem: typeof Components.VcMenuItem;
    VcNavButton: typeof Components.VcNavButton;
    VcProductPrice: typeof Components.VcProductPrice;
    VcQuantity: typeof Components.VcQuantity;
    VcSelect: typeof Components.VcSelect;
    VcSteps: typeof Components.VcSteps;
    VcTextarea: typeof Components.VcTextarea;
    VcRating: typeof Components.VcRating;
    VcVendor: typeof Components.VcVendor;
    VcWidget: typeof Components.VcWidget;
    VcWidgetSkeleton: typeof Components.VcWidgetSkeleton;
  }
}
