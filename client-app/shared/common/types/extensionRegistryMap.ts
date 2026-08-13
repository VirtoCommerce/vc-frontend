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
 * The host keeps its own markup and the plugin contributes only what it binds into it.
 * `use()` runs in the extension point's setup and is disposed with it, so it may fetch.
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
 * A category gets decorate mode only by declaring a `Contributed` shape, which it may do once its
 * host consumer renders a fallback slot. Leaving it at `never` makes a component-less entry there
 * a compile error rather than a silent no-op.
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

/** The parameter a category's `condition` accepts. */
export type ConditionParamType<C extends keyof ExtensionCategoryMapType> =
  NonNullable<ExtensionCategoryMapType[C]["condition"]> extends (parameter: infer P) => boolean ? P : unknown;

/** What a category's `use()` returns; never when it has no decorate mode. */
type DecorateMemberType<C extends keyof ExtensionCategoryMapType> = Extract<
  ExtensionCategoryMapType[C],
  { use: unknown }
>;

export type ContributionType<C extends keyof ExtensionCategoryMapType> = [DecorateMemberType<C>] extends [never]
  ? never
  : DecorateMemberType<C> extends { use: () => infer R }
    ? R
    : never;

/** The props a replace-mode entry may carry. */
export type ReplacePropsType<C extends keyof ExtensionCategoryMapType> = Extract<
  ExtensionCategoryMapType[C],
  { component: Component }
>["props"];
