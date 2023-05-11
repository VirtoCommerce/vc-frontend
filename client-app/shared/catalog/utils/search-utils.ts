import { unref } from "vue";
import type { MaybeRef } from "@vueuse/core";

export function getFilterExpressionForInStock(value: MaybeRef<boolean>): string {
  return unref(value) ? "availability:InStock" : "";
}

export function getFilterExpressionForAvailableIn(value: MaybeRef<string[]>): string {
  const branches = unref(value);
  return branches.length ? `available_in:"${branches.join('","')}"` : "";
}
