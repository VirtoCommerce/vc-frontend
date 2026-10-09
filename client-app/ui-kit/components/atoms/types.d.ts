import type * as Components from ".";

declare module "vue" {
  // Glboal components is already declated interface which we want to augment
  // eslint-disable-next-line @typescript-eslint/naming-convention
  export interface GlobalComponents {
    VcBadge: typeof Components.VcBadge;
    VcBreadcrumbs: typeof Components.VcBreadcrumbs;
    VcButton: typeof Components.VcButton;
    VcCarouselPagination: typeof Components.VcCarouselPagination;
    VcCheckbox: typeof Components.VcCheckbox;
    VcCheckboxGroup: typeof Components.VcCheckboxGroup;
    VcContainer: typeof Components.VcContainer;
    VcInputDetails: typeof Components.VcInputDetails;
    VcIcon: typeof Components.VcIcon;
    VcImage: typeof Components.VcImage;
    VcInfinityScrollLoader: typeof Components.VcInfinityScrollLoader;
    VcLabel: typeof Components.VcLabel;
    /** @deprecated Use VcProperty or VcProductProperties instead */
    VcLineItemProperty: typeof Components.VcLineItemProperty;
    VcLoader: typeof Components.VcLoader;
    VcMarkdownRender: typeof Components.VcMarkdownRender;
    VcPriceDisplay: typeof Components.VcPriceDisplay;
    VcProperty: typeof Components.VcProperty;
    VcRadioButton: typeof Components.VcRadioButton;
    VcScrollTopButton: typeof Components.VcScrollTopButton;
    VcSwitch: typeof Components.VcSwitch;
    VcTooltip: typeof Components.VcTooltip;
  }
}

export {};
