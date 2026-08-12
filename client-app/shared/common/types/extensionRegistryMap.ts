import type { CustomerOrderType, Product, SharingSettingType } from "@/core/api/graphql/types";
import type { ExtendedMenuLinkType } from "@/core/types";
import type { Component, MaybeRefOrGetter } from "vue";

type ExtensionEntryType<
  Props = never,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Condition extends (parameter: any) => boolean = never,
> = {
  component: Component;
  condition?: Condition;
  props?: Props;
  use?: never;
};

/**
 * A category whose host consumer renders fallback markup of its own. An entry may replace that
 * markup with a `component`, or keep it and contribute only what the host binds into it:
 * static `props`, or a `use()` composable.
 *
 * `use()` is called by the extension point in its own setup and disposed when it unmounts, so
 * anything that fetches or subscribes belongs there rather than in `props`.
 */
type DecoratableEntryType<
  Props = never,
  Contributed = never,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Condition extends (parameter: any) => boolean = never,
> = {
  /** Omit to keep the host's own fallback rendering and only contribute to it. */
  component?: Component;
  condition?: Condition;
  /** Partial: the host supplies the rest (e.g. `item`) as attrs at the extension point. */
  props?: Partial<Props>;
  use?: () => Contributed;
};

/**
 * Here we define the extension categories and the extension entries for each category.
 * ExtensionEntryType<Props, Condition> is a type that defines the extension entry for a given category.
 *
 * Only a category whose host consumer renders a fallback may use DecoratableEntryType. In every
 * other category an entry without a `component` renders nothing, so `component` stays required.
 */
export type ExtensionCategoryMapType = {
  headerMenu: ExtensionEntryType<{ item: ExtendedMenuLinkType }>;
  mobileMenu: DecoratableEntryType<{ item: ExtendedMenuLinkType }, { count?: MaybeRefOrGetter<number> }>;
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
