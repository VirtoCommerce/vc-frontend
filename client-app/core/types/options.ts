import type { MaybeRef } from "@vueuse/core";
import type { LocationQueryValue } from "vue-router";

export interface IUseRouteQueryParamOptions<T = LocationQueryValue | LocationQueryValue[]> {
  defaultValue?: T;
  /** @default true */
  removeFalsyValue?: boolean;
  /** @default true */
  removeNullishValue?: boolean;
  /** @default true */
  removeDefaultValue?: boolean;
  /** @default push */
  updateMethod?: "push" | "replace";
  validator?: (queryValue: NonNullable<T>) => boolean;
}

export interface IUsePageSeoData {
  /**
   * input chunks: ["title_part_1", "title_part_2"]
   * output string: title_part_1<page_title_divider>title_part_2
   */
  title?: MaybeRef<string | string[] | undefined>;
  meta?: Record<string, MaybeRef<string | undefined>>;
}
