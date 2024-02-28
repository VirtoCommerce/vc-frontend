import type * as Components from ".";

declare module "@vue/runtime-core" {
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
    VcContainer: typeof Components.VcContainer;
    VcDateSelector: typeof Components.VcDateSelector;
    VcEmptyView: typeof Components.VcEmptyView;
    VcExpansionPanels: typeof Components.VcExpansionPanels;
    /** @deprecated use {@link VcWidgetSkeleton} instead. */
    VcFilterCardSkeleton: typeof Components.VcFilterCardSkeleton;
    VcInputDetails: typeof Components.VcInputDetails;
    VcIcon: typeof Components.VcIcon;
    VcHexagonIcon: typeof Components.VcHexagonIcon;
    VcImage: typeof Components.VcImage;
    VcInfinityScrollLoader: typeof Components.VcInfinityScrollLoader;
    VcLabel: typeof Components.VcLabel;
    VcLineItemProperty: typeof Components.VcLineItemProperty;
    VcListItem: typeof Components.VcListItem;
    VcLoader: typeof Components.VcLoader;
    VcMarkdownRender: typeof Components.VcMarkdownRender;
    VcPopover: typeof Components.VcPopover;
    VcPopupSidebar: typeof Components.VcPopupSidebar;
    VcPriceDisplay: typeof Components.VcPriceDisplay;
    VcPriceDisplayCatalog: typeof Components.VcPriceDisplayCatalog;
    VcProductTitle: typeof Components.VcProductTitle;
    VcProperty: typeof Components.VcProperty;
    VcRadioButton: typeof Components.VcRadioButton;
    VcScrollTopButton: typeof Components.VcScrollTopButton;
    /** @deprecated */
    VcSelectItem: typeof Components.VcSelectItem;
    /** @deprecated */
    VcSelectItemImage: typeof Components.VcSelectItemImage;
    /** @deprecated */
    VcSelectItemText: typeof Components.VcSelectItemText;
    VcTabs: typeof Components.VcTabs;
    VcTooltip: typeof Components.VcTooltip;
    VcTotalDisplay: typeof Components.VcTotalDisplay;
    VcTransitionScale: typeof Components.VcTransitionScale;
    VcTypography: typeof Components.VcTypography;
  }
}
