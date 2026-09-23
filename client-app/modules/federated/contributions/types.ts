import type { MenuSecionType } from "@/core/types";
import type { ROUTES } from "@/router/routes/constants";
import type { SlotContextOfType, SlotIdType } from "@/shared/common/types/slotContext";

// ── What the build emits (`contributions.json`) and the host reads ────────────────────────────────

export type ConditionScalarType = string | number | boolean | null;

/**
 * One condition, serialised. The host walks this tree; nothing in it is ever parsed as an
 * expression or executed.
 *
 * - `setting` — a module setting of the store (`useModuleSettings`); truthy, or equal to `eq`.
 * - `themeSetting` — a key of the theme's `settings_data.json`; truthy, or equal to `eq`.
 * - `authenticated` — the user is signed in.
 * - `can` — the user holds that permission.
 * - `field` — a dot path into the slot's context (`SlotContextMapType`); truthy, or equal to `eq`. Slots only.
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
  /** Mounted under this host route; absent = a root route. */
  parent?: HostRouteNameType;
  name: string;
  /** A redirect entry: navigating here goes to this route name instead of rendering a page. */
  redirect?: string;
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

/** A link in the header menu schema (`useNavigations().mergeMenuSchema`). */
export interface IHeaderMenuContributionType extends IMenuLinkContributionType {
  surface: "header";
  group: MenuGroupType;
  /** Both when absent. */
  viewport?: "desktop" | "mobile";
}

/** A section of the account left rail (`useNavigations().registerAccountSection`). */
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
 * - `reserve` — hold the slot's box until the plugin settles, then reveal it.
 * - `block` — hold a whole region, capped by the plugin's own budget, where a late contribution
 *   changes behaviour rather than pixels (payment).
 * - `none` — a data contribution into markup the host renders itself; nothing to hold.
 */
export type SlotPolicyType = "reserve" | "block" | "none";

export interface ISlotContributionType {
  at: SlotIdType;
  policy: SlotPolicyType;
  when?: ConditionNodeType;
}

export interface IPluginContributionsType {
  /** Bumped on an incompatible change of this shape; the host refuses a version it does not know. */
  format: 1;
  /** Plugin-level gate: false ⇒ the host fetches nothing else of the plugin. */
  when?: ConditionNodeType;
  routes?: IRouteContributionType[];
  menu?: MenuContributionType[];
  slots?: ISlotContributionType[];
}

// ── What a plugin author writes (`plugin.config.ts`) ─────────────────────────────────────────────

type MenuGroupType = MenuSecionType | "main";

declare const conditionScope: unique symbol;

/**
 * A condition as the builders hand it out. The phantom scope is what makes a `field(...)` term a
 * compile error anywhere but a slot: there is no item to read before the plugin is fetched.
 */
export type ConditionType<S extends "global" | "slot"> = ConditionNodeType & { readonly [conditionScope]?: S };

export type GlobalConditionType = ConditionType<"global">;
export type SlotConditionType = ConditionType<"global" | "slot">;

/** `settingValue(...)`, `themeSetting(...)`: truthy as they stand, or compared with `.eq(...)`. */
export type ComparableConditionType<S extends "global" | "slot", V = ConditionScalarType> = ConditionType<S> & {
  eq(value: V): ConditionType<S>;
};

type DepthType = [never, 0, 1, 2, 3];

/** Every dot path into `T` that ends on a scalar, four levels deep; arrays are not traversed. */
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

/**
 * An enum-typed string field compares as a string: a plugin may own values the host's generated
 * enum does not list (sales-rep's `Customer` sharing scope).
 */
type WidenedType<V> = V extends string ? string : V extends number ? number : V extends boolean ? boolean : never;

/** Handed to a slot's `when` callback, typed against that slot's context. */
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
    /** A global condition, or a callback that receives `field` typed against this slot's context. */
    when?: GlobalConditionType | ((field: FieldBuilderType<SlotContextOfType<Id>>) => SlotConditionType);
  };
}[SlotIdType];

export interface IPluginManifestConfigType {
  when?: GlobalConditionType;
  routes?: RouteDeclarationType[];
  menu?: MenuDeclarationType[];
  slots?: SlotDeclarationType[];
}
