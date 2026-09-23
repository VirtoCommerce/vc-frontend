import type { EXTENSION_NAMES } from "@/shared/common/constants/extensionPointsNames";
import type { ExtensionCategoryType } from "@/shared/common/types/extensionRegistry";
import type { ConditionParamType } from "@/shared/common/types/extensionRegistryMap";

type NamedCategoryType = keyof typeof EXTENSION_NAMES;

/**
 * The names a slot id may carry after its category. A category listed in `EXTENSION_NAMES` accepts
 * only those names; the rest (the menus, `mobileHeader`, `cartPayment`) are keyed by an id the
 * plugin owns, such as its own menu link id.
 */
type SlotNameType<C extends ExtensionCategoryType> = C extends NamedCategoryType
  ? (typeof EXTENSION_NAMES)[C][keyof (typeof EXTENSION_NAMES)[C]]
  : string;

/** `"<category>/<name>"`, the address of one extension point. */
export type SlotIdType = {
  [C in ExtensionCategoryType]: `${C}/${SlotNameType<C>}`;
}[ExtensionCategoryType];

type CategoryOfType<Id extends string> = Id extends `${infer C}/${string}`
  ? C extends ExtensionCategoryType
    ? C
    : never
  : never;

/**
 * What the host hands a slot's condition when it renders it: the extension point's
 * `conditionParameter`, i.e. exactly what a registered entry's `condition` receives. Derived from the
 * registry, so a host-side change to a category's condition parameter changes this type — and the
 * generated contract with it.
 */
export type SlotContextMapType = {
  [C in ExtensionCategoryType as `${C}/${SlotNameType<C>}`]: ConditionParamType<C>;
};

export type SlotContextOfType<Id extends SlotIdType> = ConditionParamType<CategoryOfType<Id>>;
