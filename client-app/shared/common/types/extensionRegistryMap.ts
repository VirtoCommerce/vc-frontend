import type { CustomerOrderType, Product, SharingSettingType } from "@/core/api/graphql/types";
import type { ExtendedMenuLinkType } from "@/core/types";
import type { Component, MaybeRefOrGetter } from "vue";

/** The plugin renders its own markup in place of the host's. */
type ReplaceEntryType<
  Props = never,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Condition extends (parameter: any) => boolean = never,
> = {
  component: Component;
  condition?: Condition;
  props?: Props;
};

/**
 * The host keeps its own markup and the plugin contributes only what the host binds into it.
 *
 * `use()` is called by the extension point in its own setup and disposed when it unmounts, so a
 * contribution may fetch or subscribe. It is deliberately a composable rather than a value: a
 * getter passed as data would be invoked during render, where nothing can be cleaned up.
 */
type DecorateEntryType<
  Contributed = never,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Condition extends (parameter: any) => boolean = never,
> = {
  component?: never;
  condition?: Condition;
  use: () => Contributed;
};

/**
 * Decorate mode exists for a category only if it declares a `Contributed` shape — which it may
 * only do once its host consumer renders a fallback slot to bind that data into. Categories that
 * leave `Contributed` at `never` get the replace-only shape, so a component-less registration
 * there is not merely useless but unrepresentable.
 */
type ExtensionEntryType<
  Props = never,
  Contributed = never,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Condition extends (parameter: any) => boolean = never,
> = [Contributed] extends [never]
  ? ReplaceEntryType<Props, Condition>
  : ReplaceEntryType<Props, Condition> | DecorateEntryType<Contributed, Condition>;

/**
 * Here we define the extension categories and the extension entries for each category.
 * ExtensionEntryType<Props, Contributed, Condition> defines the entry for a given category.
 */
export type ExtensionCategoryMapType = {
  headerMenu: ExtensionEntryType<{ item: ExtendedMenuLinkType }>;
  mobileMenu: ExtensionEntryType<{ item: ExtendedMenuLinkType }, { count?: MaybeRefOrGetter<number> }>;
  accountMenu: ExtensionEntryType<{ item: ExtendedMenuLinkType }>;
  mobileHeader: ExtensionEntryType;
  productCard: ExtensionEntryType<
    { product?: Product; isTextShown?: boolean; lazy?: boolean },
    never,
    (product: Product) => boolean
  >;
  productPage: ExtensionEntryType<{ product?: Product }, never, (product: Product) => boolean>;
  paymentPage: ExtensionEntryType<
    { order: CustomerOrderType; paymentTypeName: string },
    never,
    ({ order, paymentTypeName }: { order: CustomerOrderType; paymentTypeName: string }) => boolean
  >;
  orderPaymentPage: ExtensionEntryType<
    { order: CustomerOrderType; paymentTypeName: string },
    never,
    ({ order, paymentTypeName }: { order: CustomerOrderType; paymentTypeName: string }) => boolean
  >;
  /** The publicly reachable shared-list page. A provider decides from the sharing setting whether it has anything to say. */
  sharedList: ExtensionEntryType<
    { sharingSetting?: SharingSettingType },
    never,
    (sharingSetting?: SharingSettingType) => boolean
  >;
};

/** What a category's `use()` returns; never for a category with no decorate mode. */
type DecorateMemberType<C extends keyof ExtensionCategoryMapType> = Extract<
  ExtensionCategoryMapType[C],
  { use: unknown }
>;

export type ContributionType<C extends keyof ExtensionCategoryMapType> = [DecorateMemberType<C>] extends [never]
  ? never
  : DecorateMemberType<C> extends { use: () => infer R }
    ? R
    : never;

/** The replace-mode props a category accepts, for the accessor that reads them. */
export type ReplacePropsType<C extends keyof ExtensionCategoryMapType> = Extract<
  ExtensionCategoryMapType[C],
  { component: Component }
>["props"];
