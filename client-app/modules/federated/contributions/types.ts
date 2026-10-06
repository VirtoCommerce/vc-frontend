import type { MenuSecionType } from "@/core/types";
import type { ROUTES } from "@/router/routes/constants";
import type { SlotContextOfType, SlotIdType } from "@/shared/common/types/slotContext";

// ── Emitted by the build, read by the host ──

export type ConditionScalarType = string | number | boolean | null;

/**
 * A serialised condition; never parsed or executed.
 *
 * - `setting` — a store module setting; `true`, or equal to `eq`.
 * - `themeSetting` — a `settings_data.json` key; truthy, or equal to `eq`.
 * - `authenticated` — the user is signed in.
 * - `can` — the user holds that permission.
 * - `field` — a dot path into the slot's context; truthy, or equal to `eq`. Slots only.
 */
export type ConditionNodeType =
  | { setting: string; eq?: ConditionScalarType }
  | { themeSetting: string; eq?: ConditionScalarType }
  | { authenticated: true }
  | { can: string }
  | { field: string; eq?: ConditionScalarType }
  | { and: ConditionNodeType[] }
  | { or: ConditionNodeType[] }
  | { not: ConditionNodeType };

export type HostRouteNameType = (typeof ROUTES)[keyof typeof ROUTES]["NAME"];

export interface IRouteContributionType {
  path: string;
  /** Host parent route; absent = root. */
  parent?: HostRouteNameType;
  name: string;
  when?: ConditionNodeType;
}

export interface IMenuLinkContributionType {
  id: string;
  title: string;
  icon?: string;
  priority?: number;
  routeName: string;
  when?: ConditionNodeType;
}

export interface IHeaderMenuContributionType extends IMenuLinkContributionType {
  surface: "header";
  group: MenuGroupType;
  /** Both when absent. */
  viewport?: "desktop" | "mobile";
}

export interface IAccountMenuContributionType {
  surface: "account";
  id: string;
  title: string;
  icon?: string;
  priority?: number;
  when?: ConditionNodeType;
  children: IMenuLinkContributionType[];
}

export type MenuContributionType = IHeaderMenuContributionType | IAccountMenuContributionType;

/**
 * - `reserve` — hold the slot's box until the plugin settles.
 * - `block` — hold a whole region, with a loader (e.g. payment).
 * - `none` — hold nothing; the plugin only decorates host markup.
 */
export type SlotPolicyType = "reserve" | "block" | "none";

export interface ISlotContributionType {
  at: SlotIdType;
  policy: SlotPolicyType;
  when?: ConditionNodeType;
}

export interface IPluginContributionsType {
  /** The host refuses a format it does not know. */
  format: 1;
  /** False: the host fetches nothing of the plugin. */
  when?: ConditionNodeType;
  routes?: IRouteContributionType[];
  menu?: MenuContributionType[];
  slots?: ISlotContributionType[];
}

// ── Written in `plugin.config.ts` ──

type MenuGroupType = MenuSecionType | "main";

declare const conditionScope: unique symbol;

/** The phantom scope makes a `field(...)` term a compile error outside a slot. */
export type ConditionType<S extends "global" | "slot"> = ConditionNodeType & { readonly [conditionScope]?: S };

export type GlobalConditionType = ConditionType<"global">;
export type SlotConditionType = ConditionType<"global" | "slot">;

export type ComparableConditionType<S extends "global" | "slot", V = ConditionScalarType> = ConditionType<S> & {
  eq(value: V): ConditionType<S>;
};

type DepthType = [never, 0, 1, 2, 3];

/** Dot paths to scalars, four levels deep; arrays are not traversed. */
export type FieldPathType<T, D extends number = 4> = [D] extends [never]
  ? never
  : T extends ConditionScalarType
    ? never
    : T extends readonly unknown[]
      ? never
      : T extends object
        ? {
            [K in Extract<keyof T, string>]: NonNullable<T[K]> extends ConditionScalarType
              ? K
              : NonNullable<T[K]> extends readonly unknown[]
                ? never
                : `${K}.${FieldPathType<NonNullable<T[K]>, DepthType[D]>}`;
          }[Extract<keyof T, string>]
        : never;

export type FieldValueType<T, P extends string> = P extends `${infer H}.${infer R}`
  ? H extends keyof T
    ? FieldValueType<NonNullable<T[H]>, R>
    : never
  : P extends keyof T
    ? NonNullable<T[P]>
    : never;

/** Enums widen: a plugin may own values the host's generated enum lacks. */
type WidenedType<V> = V extends string ? string : V extends number ? number : V extends boolean ? boolean : never;

export type FieldBuilderType<Ctx> = <P extends FieldPathType<NonNullable<Ctx>>>(
  path: P,
) => ComparableConditionType<"slot", WidenedType<FieldValueType<NonNullable<Ctx>, P>>>;

type WithGlobalWhenType<T> = Omit<T, "when"> & { when?: GlobalConditionType };

export type RouteDeclarationType = WithGlobalWhenType<IRouteContributionType>;

export type MenuLinkDeclarationType = WithGlobalWhenType<IMenuLinkContributionType>;

export type MenuDeclarationType =
  | WithGlobalWhenType<IHeaderMenuContributionType>
  | (WithGlobalWhenType<Omit<IAccountMenuContributionType, "children">> & { children: MenuLinkDeclarationType[] });

export type SlotDeclarationType = {
  [Id in SlotIdType]: {
    at: Id;
    policy: SlotPolicyType;
    /** A global condition, or a callback receiving `field` typed against this slot's context. */
    when?: GlobalConditionType | ((field: FieldBuilderType<SlotContextOfType<Id>>) => SlotConditionType);
  };
}[SlotIdType];

export interface IPluginManifestConfigType {
  when?: GlobalConditionType;
  routes?: RouteDeclarationType[];
  menu?: MenuDeclarationType[];
  slots?: SlotDeclarationType[];
}
