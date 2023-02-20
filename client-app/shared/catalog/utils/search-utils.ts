import { MaybeRef } from "@vueuse/core";
import { unref } from "vue";

export function getFilterExpressionForInStock(value: MaybeRef<boolean>): string {
  return unref(value) ? "instock_quantity:(0 TO)" : "";
}

export function getFilterExpressionForAvailableIn(value: MaybeRef<string[]>): string {
  const branches = unref(value);
  return branches.length ? `available_in:"${branches.join('","')}"` : "";
}
