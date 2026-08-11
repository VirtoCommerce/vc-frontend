import type { CustomerOrderType, Product, SharingSettingType } from "@/core/api/graphql/types";
import type { ExtendedMenuLinkType } from "@/core/types";
import type { Component, MaybeRefOrGetter } from "vue";

type ExtensionEntryType<
  Props = never,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Condition extends (parameter: any) => boolean = never,
> = {
  /** Omit to keep the host's own fallback rendering and only contribute `props` to it. */
  component?: Component;
  condition?: Condition;
  /** Partial: the host supplies the rest (e.g. `item`) as attrs at the extension point. */
  props?: Partial<Props>;
};

/**
 * Here we define the extension categories and the extension entries for each category.
 * ExtensionEntryType<Props, Condition> is a type that defines the extension entry for a given category.
 */
export type ExtensionCategoryMapType = {
  headerMenu: ExtensionEntryType<{ item: ExtendedMenuLinkType }>;
  mobileMenu: ExtensionEntryType<{ item: ExtendedMenuLinkType; count?: MaybeRefOrGetter<number> }>;
  accountMenu: ExtensionEntryType<{ item: ExtendedMenuLinkType }>;
  mobileHeader: ExtensionEntryType;
  productCard: ExtensionEntryType<
    { product?: Product; isTextShown?: boolean; lazy?: boolean },
    (product: Product) => boolean
  >;
  productPage: ExtensionEntryType<{ product?: Product }, (product: Product) => boolean>;
  paymentPage: ExtensionEntryType<
    { order: CustomerOrderType; paymentTypeName: string },
    ({ order, paymentTypeName }: { order: CustomerOrderType; paymentTypeName: string }) => boolean
  >;
  orderPaymentPage: ExtensionEntryType<
    { order: CustomerOrderType; paymentTypeName: string },
    ({ order, paymentTypeName }: { order: CustomerOrderType; paymentTypeName: string }) => boolean
  >;
  /** The publicly reachable shared-list page. A provider decides from the sharing setting whether it has anything to say. */
  sharedList: ExtensionEntryType<
    { sharingSetting?: SharingSettingType },
    (sharingSetting?: SharingSettingType) => boolean
  >;
};
