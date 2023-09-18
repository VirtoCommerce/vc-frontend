import type * as Components from ".";

declare module "@vue/runtime-core" {
  // Glboal components is already declated interface which we want to augment
  // eslint-disable-next-line @typescript-eslint/naming-convention
  export interface GlobalComponents {
    /**
     * @deprecated the component will be removed from ui-kit
     */
    VcActionDropdownMenu: typeof Components.VcActionDropdownMenu;
    VcActionInput: typeof Components.VcActionInput;
    VcAddressLine: typeof Components.VcAddressLine;
    VcBadge: typeof Components.VcBadge;
    VcBreadcrumbs: typeof Components.VcBreadcrumbs;
    VcButton: typeof Components.VcButton;
    VcCard: typeof Components.VcCard;
    VcCardWidget: typeof Components.VcCardWidget;
    VcCardSkeleton: typeof Components.VcCardSkeleton;
    VcCheckbox: typeof Components.VcCheckbox;
    VcChip: typeof Components.VcChip;
    VcContainer: typeof Components.VcContainer;
    VcCountInCart: typeof Components.VcCountInCart;
    VcDateSelector: typeof Components.VcDateSelector;
    VcEmptyView: typeof Components.VcEmptyView;
    VcExpansionPanels: typeof Components.VcExpansionPanels;
    VcFilterCard: typeof Components.VcFilterCard;
    VcFilterCardSkeleton: typeof Components.VcFilterCardSkeleton;
    VcInputDetails: typeof Components.VcInputDetails;
    VcIcon: typeof Components.VcIcon;
    VcHexagonIcon: typeof Components.VcHexagonIcon;
    VcImage: typeof Components.VcImage;
    VcInStock: typeof Components.VcInStock;
    VcInfinityScrollLoader: typeof Components.VcInfinityScrollLoader;
    VcLabel: typeof Components.VcLabel;
    VcLineItemProperty: typeof Components.VcLineItemProperty;
    VcListItem: typeof Components.VcListItem;
    VcLoader: typeof Components.VcLoader;
    VcMarkdownRender: typeof Components.VcMarkdownRender;
    VcPagination: typeof Components.VcPagination;
    VcPopover: typeof Components.VcPopover;
    VcPopupSidebar: typeof Components.VcPopupSidebar;
    VcPriceDisplay: typeof Components.VcPriceDisplay;
    VcPriceDisplayCatalog: typeof Components.VcPriceDisplayCatalog;
    VcProperty: typeof Components.VcProperty;
    VcRadioButton: typeof Components.VcRadioButton;
    VcScrollTopButton: typeof Components.VcScrollTopButton;
    VcSection: typeof Components.VcSection;
    VcSectionWidget: typeof Components.VcSectionWidget;
    VcSelectItem: typeof Components.VcSelectItem;
    VcSelectItemImage: typeof Components.VcSelectItemImage;
    VcSelectItemText: typeof Components.VcSelectItemText;
    VcTabs: typeof Components.VcTabs;
    VcTooltip: typeof Components.VcTooltip;
    VcTotalDisplay: typeof Components.VcTotalDisplay;
    VcTransitionScale: typeof Components.VcTransitionScale;
    VcTypography: typeof Components.VcTypography;
  }
}
