import type * as Components from ".";

declare module "vue" {
  // Glboal components is already declated interface which we want to augment
  // eslint-disable-next-line @typescript-eslint/naming-convention
  export interface GlobalComponents {
    VcActionInput: typeof Components.VcActionInput;
    VcAlert: typeof Components.VcAlert;
    VcButton: typeof Components.VcButton;
    VcButtonSeeMoreLess: typeof Components.VcButtonSeeMoreLess;
    VcCalendar: typeof Components.VcCalendar;
    VcCarousel: typeof Components.VcCarousel;
    VcChip: typeof Components.VcChip;
    VcCollapsibleContent: typeof Components.VcCollapsibleContent;
    VcCompositeShape: typeof Components.VcCompositeShape;
    VcCopyText: typeof Components.VcCopyText;
    VcDateInput: typeof Components.VcDateInput;
    /** @deprecated Use VcDatePicker for typed date entry with calendar popover, or VcDateInput for input-only. */
    VcDateSelector: typeof Components.VcDateSelector;
    VcDialog: typeof Components.VcDialog;
    VcDialogContent: typeof Components.VcDialogContent;
    VcDialogFooter: typeof Components.VcDialogFooter;
    VcDialogHeader: typeof Components.VcDialogHeader;
    VcDropdownMenu: typeof Components.VcDropdownMenu;
    VcEmptyView: typeof Components.VcEmptyView;
    VcExpansionPanel: typeof Components.VcExpansionPanel;
    VcExpansionPanels: typeof Components.VcExpansionPanels;
    VcFileUploader: typeof Components.VcFileUploader;
    VcFile: typeof Components.VcFile;
    VcFilePicker: typeof Components.VcFilePicker;
    VcInput: typeof Components.VcInput;
    /** @deprecated Use VcProductPrice instead */
    VcItemPriceCatalog: typeof Components.VcItemPriceCatalog;
    VcLineItem: typeof Components.VcLineItem;
    VcLineItems: typeof Components.VcLineItems;
    VcList: typeof Components.VcList;
    VcListItem: typeof Components.VcListItem;
    VcLoaderOverlay: typeof Components.VcLoaderOverlay;
    VcLoaderWithText: typeof Components.VcLoaderWithText;
    VcMenuItem: typeof Components.VcMenuItem;
    VcNavButton: typeof Components.VcNavButton;
    VcPopover: typeof Components.VcPopover;
    /** @deprecated Use VcPriceDisplay or VcProductPrice instead */
    VcPriceDisplayCatalog: typeof Components.VcPriceDisplayCatalog;
    VcProductActions: typeof Components.VcProductActions;
    VcProductActionsButton: typeof Components.VcProductActionsButton;
    VcProductPrice: typeof Components.VcProductPrice;
    VcProductProperties: typeof Components.VcProductProperties;
    VcProductTitle: typeof Components.VcProductTitle;
    VcProductTotal: typeof Components.VcProductTotal;
    VcProductVendor: typeof Components.VcProductVendor;
    VcProductsGrid: typeof Components.VcProductsGrid;
    VcSelect: typeof Components.VcSelect;
    VcShape: typeof Components.VcShape;
    VcSlider: typeof Components.VcSlider;
    VcSteps: typeof Components.VcSteps;
    VcTabSwitch: typeof Components.VcTabSwitch;
    VcTextarea: typeof Components.VcTextarea;
    VcRating: typeof Components.VcRating;
    VcTotalDisplay: typeof Components.VcTotalDisplay;
    VcTypography: typeof Components.VcTypography;
    VcVariantPicker: typeof Components.VcVariantPicker;
    VcVariantPickerGroup: typeof Components.VcVariantPickerGroup;
  }
}

export {};
