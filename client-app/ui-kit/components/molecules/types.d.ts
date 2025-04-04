import type * as Components from ".";

declare module "vue" {
  // Glboal components is already declated interface which we want to augment
  // eslint-disable-next-line @typescript-eslint/naming-convention
  export interface GlobalComponents {
    VcAlert: typeof Components.VcAlert;
    VcButton: typeof Components.VcButton;
    VcButtonSeeMoreLess: typeof Components.VcButtonSeeMoreLess;
    VcCarousel: typeof Components.VcCarousel;
    VcChip: typeof Components.VcChip;
    VcCollapsibleContent: typeof Components.VcCollapsibleContent;
    VcCompositeShape: typeof Components.VcCompositeShape;
    VcCopyText: typeof Components.VcCopyText;
    VcDialogContent: typeof Components.VcDialogContent;
    VcDialogFooter: typeof Components.VcDialogFooter;
    VcDialogHeader: typeof Components.VcDialogHeader;
    VcDropdownMenu: typeof Components.VcDropdownMenu;
    VcEmptyPage: typeof Components.VcEmptyPage;
    VcExpansionPanel: typeof Components.VcExpansionPanel;
    VcFileUploader: typeof Components.VcFileUploader;
    VcFile: typeof Components.VcFile;
    VcFilePicker: typeof Components.VcFilePicker;
    VcInput: typeof Components.VcInput;
    VcItemPrice: typeof Components.VcItemPrice;
    VcItemPriceCatalog: typeof Components.VcItemPriceCatalog;
    VcLineItem: typeof Components.VcLineItem;
    VcLineItems: typeof Components.VcLineItems;
    /** @deprecated VcLineItemPrice is deprecated, use VcProductPrice instead. */
    VcLineItemPrice: typeof Components.VcLineItemPrice;
    /** @deprecated VcLineItemTotal is deprecated, use VcProductPrice instead. */
    VcLineItemTotal: typeof Components.VcLineItemTotal;
    VcList: typeof Components.VcList;
    VcLoaderOverlay: typeof Components.VcLoaderOverlay;
    VcLoaderWithText: typeof Components.VcLoaderWithText;
    VcMenuItem: typeof Components.VcMenuItem;
    VcNavButton: typeof Components.VcNavButton;
    VcProductActionsButton: typeof Components.VcProductActionsButton;
    VcProductButton: typeof Components.VcProductButton;
    VcProductPrice: typeof Components.VcProductPrice;
    VcProductTotal: typeof Components.VcProductTotal;
    // @deprecated
    VcSelect: typeof Components.VcSelect;
    VcShape: typeof Components.VcShape;
    VcSteps: typeof Components.VcSteps;
    VcTabSwitch: typeof Components.VcTabSwitch;
    VcTextarea: typeof Components.VcTextarea;
    VcRating: typeof Components.VcRating;
    VcWidget: typeof Components.VcWidget;
    VcWidgetSkeleton: typeof Components.VcWidgetSkeleton;
  }
}

export {};
