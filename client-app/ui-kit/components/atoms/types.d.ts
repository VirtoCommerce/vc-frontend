import type * as Components from ".";

declare module "vue" {
  // Glboal components is already declated interface which we want to augment
  // eslint-disable-next-line @typescript-eslint/naming-convention
  export interface GlobalComponents {
    VcActionInput: typeof Components.VcActionInput;
    VcAddressLine: typeof Components.VcAddressLine;
    VcBadge: typeof Components.VcBadge;
    VcBreadcrumbs: typeof Components.VcBreadcrumbs;
    VcButton: typeof Components.VcButton;
    VcCardSkeleton: typeof Components.VcCardSkeleton;
    VcCarouselPagination: typeof Components.VcCarouselPagination;
    VcCheckbox: typeof Components.VcCheckbox;
    VcCheckboxGroup: typeof Components.VcCheckboxGroup;
    VcContainer: typeof Components.VcContainer;
    VcDateSelector: typeof Components.VcDateSelector;
    VcDialog: typeof Components.VcDialog;
    VcEmptyView: typeof Components.VcEmptyView;
    VcExpansionPanels: typeof Components.VcExpansionPanels;
    VcInputDetails: typeof Components.VcInputDetails;
    VcIcon: typeof Components.VcIcon;
    VcImage: typeof Components.VcImage;
    VcInfinityScrollLoader: typeof Components.VcInfinityScrollLoader;
    VcLabel: typeof Components.VcLabel;
    VcLayout: typeof Components.VcLayout;
    VcLineItemProperty: typeof Components.VcLineItemProperty;
    VcListItem: typeof Components.VcListItem;
    VcLoader: typeof Components.VcLoader;
    VcMarkdownRender: typeof Components.VcMarkdownRender;
    VcPopover: typeof Components.VcPopover;
    VcPopupSidebar: typeof Components.VcPopupSidebar;
    VcPriceDisplay: typeof Components.VcPriceDisplay;
    VcPriceDisplayCatalog: typeof Components.VcPriceDisplayCatalog;
    VcProductActions: typeof Components.VcProductActions;
    VcProductProperties: typeof Components.VcProductProperties;
    VcProductTitle: typeof Components.VcProductTitle;
    VcProductVendor: typeof Components.VcProductVendor;
    VcProductsGrid: typeof Components.VcProductsGrid;
    VcProperty: typeof Components.VcProperty;
    VcRadioButton: typeof Components.VcRadioButton;
    VcScrollTopButton: typeof Components.VcScrollTopButton;
    VcSwitch: typeof Components.VcSwitch;
    VcTabs: typeof Components.VcTabs;
    VcTooltip: typeof Components.VcTooltip;
    VcTotalDisplay: typeof Components.VcTotalDisplay;
    VcTypography: typeof Components.VcTypography;
  }
}

export {};
