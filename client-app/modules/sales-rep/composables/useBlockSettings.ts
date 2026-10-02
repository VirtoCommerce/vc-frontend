import { inject, provide } from "vue";
import type { MaxRowsSettingType } from "./useLayoutSettings";
import type { SalesRepBlockSettingsType } from "../types/layout";
import type { ComputedRef, InjectionKey } from "vue";

/** A `LayoutBlock`'s edit mode and per-widget settings (VCST-5649), offered to the widget inside it. */
export interface IBlockSettingsContextType {
  /** Edit mode itself. */
  editing: ComputedRef<boolean>;
  /** This block's settings as the rep has them in the draft. */
  settings: ComputedRef<SalesRepBlockSettingsType>;
  /** The saved settings — what to fetch with, so an unsaved row cap does not refire the query. */
  savedSettings: ComputedRef<SalesRepBlockSettingsType>;
  /** Present only for a block whose registry entry declares a row cap. */
  maxRows: ComputedRef<MaxRowsSettingType | undefined>;
  updateSettings: (patch: Partial<SalesRepBlockSettingsType>) => void;
}

const BLOCK_SETTINGS = Symbol("blockSettings") as InjectionKey<IBlockSettingsContextType | undefined>;

/** `undefined` withdraws the offer from everything below, as a widget does once it has taken it. */
export function provideBlockSettings(context: IBlockSettingsContextType | undefined): void {
  provide(BLOCK_SETTINGS, context);
}

/** `undefined` for a widget rendered outside a layout, which then reads its defaults. */
export function useBlockSettings(): IBlockSettingsContextType | undefined {
  return inject(BLOCK_SETTINGS, undefined);
}
