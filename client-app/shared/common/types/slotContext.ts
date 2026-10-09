import type { EXTENSION_NAMES } from "@/shared/common/constants/extensionPointsNames";
import type { ExtensionCategoryType } from "@/shared/common/types/extensionRegistry";
import type { ConditionParamType } from "@/shared/common/types/extensionRegistryMap";

type NamedCategoryType = keyof typeof EXTENSION_NAMES;

// Categories outside `EXTENSION_NAMES` are keyed by a plugin-owned id.
type SlotNameType<C extends ExtensionCategoryType> = C extends NamedCategoryType
  ? (typeof EXTENSION_NAMES)[C][keyof (typeof EXTENSION_NAMES)[C]]
  : string;

/** `"<category>/<name>"` */
export type SlotIdType = {
  [C in ExtensionCategoryType]: `${C}/${SlotNameType<C>}`;
}[ExtensionCategoryType];

type CategoryOfType<Id extends string> = Id extends `${infer C}/${string}`
  ? C extends ExtensionCategoryType
    ? C
    : never
  : never;

/** Each slot's context: its extension point's `conditionParameter`, derived from the registry. */
export type SlotContextMapType = {
  [C in ExtensionCategoryType as `${C}/${SlotNameType<C>}`]: ConditionParamType<C>;
};

export type SlotContextOfType<Id extends SlotIdType> = ConditionParamType<CategoryOfType<Id>>;
