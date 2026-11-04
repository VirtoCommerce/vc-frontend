import type {
  ConfigurationSectionInput,
  CustomerOrderType,
  Product,
  SharingSettingType,
} from "@/core/api/graphql/types";
import type { ExtendedMenuLinkType } from "@/core/types";
import type { SignInMethodContributionType } from "@/shared/account/types";
import type { IPaymentMethodParameters } from "@/shared/payment/components/types";
import type { Component, MaybeRefOrGetter } from "vue";

/** What a menu link entry contributes to the link the host draws: a count, shown as a badge. */
export type MenuCountContributionType = { count?: MaybeRefOrGetter<number> };

/**
 * What the host passes to each `productActions` entry. The host may put a layout class on the
 * entry's root, so render a single root element.
 */
export type ProductActionPropsType = {
  product: Product;
  /** The product page's current configurator selection. Absent on cards. */
  configurationSections?: ConfigurationSectionInput[];
};

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
  // Excess-property checking is lenient against a union — without this, `props` would be
  // accepted here because the replace branch has it, and then silently ignored.
  props?: never;
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
  headerMenu: ExtensionEntryType<{ item: ExtendedMenuLinkType }, MenuCountContributionType>;
  mobileMenu: ExtensionEntryType<{ item: ExtendedMenuLinkType }, MenuCountContributionType>;
  accountMenu: ExtensionEntryType<{ item: ExtendedMenuLinkType }>;
  mobileHeader: ExtensionEntryType;
  topHeaderStatus: ExtensionEntryType;
  productCard: ExtensionEntryType<
    { product?: Product; isTextShown?: boolean; lazy?: boolean },
    never,
    (product: Product) => boolean
  >;
  productPage: ExtensionEntryType<{ product?: Product }, never, (product: Product) => boolean>;
  /** The icon buttons beside "Add to list" on the catalog card, the related-product card and the product page. */
  productActions: ExtensionEntryType<Partial<ProductActionPropsType>, never, (product: Product) => boolean>;
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
  /** The cart-stage payment step (`shared/payment/components/payment.vue`). */
  cartPayment: ExtensionEntryType<
    IPaymentMethodParameters,
    never,
    ({ paymentTypeName }: { paymentTypeName: string }) => boolean
  >;
  /** The order details page. A provider decides from the order whether it has anything to offer. */
  orderDetails: ExtensionEntryType<{ order?: CustomerOrderType }, never, (order?: CustomerOrderType) => boolean>;
  /** The publicly reachable shared-list page. A provider decides from the sharing setting whether it has anything to say. */
  sharedList: ExtensionEntryType<
    { sharingSetting?: SharingSettingType },
    never,
    (sharingSetting?: SharingSettingType) => boolean
  >;
  /** The cart and checkout review steps. A provider decides on its own state whether it takes over. */
  checkout: ExtensionEntryType<never, never, () => boolean>;
  /** The sign-in buttons, keyed by the authentication type. */
  identityProviders: ExtensionEntryType;
  /** The account security page, keyed by the sign-in method name. */
  signInMethods: DecorateEntryType<SignInMethodContributionType>;
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

/** A category's replace-mode entry: the only shape `register()` accepts. */
export type ReplaceEntryOfType<C extends keyof ExtensionCategoryMapType> = Extract<
  ExtensionCategoryMapType[C],
  { component: Component }
>;

/** The props a replace-mode entry may carry. */
export type ReplacePropsType<C extends keyof ExtensionCategoryMapType> = ReplaceEntryOfType<C>["props"];

/**
 * The categories that declared a contributed shape, i.e. the ones whose host consumer renders a
 * fallback slot to receive it. `registerContribution()` accepts nothing else, so a helper that
 * widens its category argument to `ExtensionCategoryType` fails on the argument rather than
 * slipping a component-less entry into a category that would silently discard it.
 */
export type DecorateCapableCategoryType = {
  [C in keyof ExtensionCategoryMapType]: [ContributionType<C>] extends [never] ? never : C;
}[keyof ExtensionCategoryMapType];

/** A category's decorate-mode entry: the only shape `registerContribution()` accepts. */
export type ContributionEntryOfType<C extends DecorateCapableCategoryType> = DecorateMemberType<C>;
