// The surface-level settings seam (VCST-5649). `layout-surface.vue` owns the draft and the registry,
// so it is the only component that can answer both "what did the rep choose for this block" and
// "what is this block allowed to choose from"; `layout-block.vue` injects this and folds each block's
// slice into the chrome it already provides.
import { inject, provide } from "vue";
import type { SalesRepBlockSettingsType, SalesRepBlockSettingType } from "../types/layout";
import type { InjectionKey } from "vue";

export type MaxRowsSettingType = Extract<SalesRepBlockSettingType, { kind: "maxRows" }>;

export interface ILayoutSettingsType {
  valuesOf: (blockId: string) => SalesRepBlockSettingsType;
  /** The saved values, ignoring the draft — what a widget fetches with, so typing does not refetch. */
  savedValuesOf: (blockId: string) => SalesRepBlockSettingsType;
  /** The descriptor, not the value — the rows input needs its own block's bounds. */
  maxRowsOf: (blockId: string) => MaxRowsSettingType | undefined;
  update: (blockId: string, patch: Partial<SalesRepBlockSettingsType>) => void;
}

const LAYOUT_SETTINGS = Symbol("layoutSettings") as InjectionKey<ILayoutSettingsType>;

export function provideLayoutSettings(settings: ILayoutSettingsType): void {
  provide(LAYOUT_SETTINGS, settings);
}

/** `undefined` outside a layout surface, where a widget renders its own defaults. */
export function useLayoutSettings(): ILayoutSettingsType | undefined {
  return inject(LAYOUT_SETTINGS, undefined);
}
