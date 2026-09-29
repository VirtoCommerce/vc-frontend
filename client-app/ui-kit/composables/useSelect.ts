import { isEqual, union } from "lodash-es";
import { computed } from "vue";
import type { Ref } from "vue";

type ParamsType<T, V> = {
  items: Ref<T[]>;
  modelValue: Ref<V | V[] | undefined>;
  multiple: Ref<boolean | undefined>;
  filterValue: Ref<string>;
  /** When true the list is filtered by the consumer (server-side) and must pass through untouched. */
  serverFilter?: Ref<boolean | undefined>;
  textField?: Ref<VcSelectFieldAccessorType<T, string> | undefined>;
  valueField?: Ref<VcSelectFieldAccessorType<T, V> | undefined>;
};

// `!item`, not a null check: a falsy option (0, "", false) resolves to itself.
function readField<T, R>(item: T, accessor: VcSelectFieldAccessorType<T, R> | undefined): unknown {
  if (accessor === undefined || !item) {
    return item;
  }

  if (typeof accessor === "function") {
    return accessor(item);
  }

  return (item as Record<string, unknown>)[accessor];
}

export function useSelect<T, V>(params: ParamsType<T, V>) {
  function getItemText(item: T): unknown {
    return readField(item, params.textField?.value);
  }

  function getItemValue(item: T): V {
    return readField(item, params.valueField?.value) as V;
  }

  /** Model entries are always values, in both modes — never whole items. */
  const selectedValues = computed<V[]>(() => {
    if (!params.multiple.value) {
      return [];
    }

    return Array.isArray(params.modelValue.value) ? params.modelValue.value : [];
  });

  // Without `valueField` the model is the item, so an unmatched value is still handed back.
  const selectedItem = computed<T | undefined>(() => {
    const found = params.multiple.value
      ? undefined
      : params.items.value.find((item) => getItemValue(item) === params.modelValue.value);

    const rawModelIsTheItem = !params.multiple.value && params.valueField?.value === undefined;

    return found ?? (rawModelIsTheItem ? (params.modelValue.value as T | undefined) : undefined);
  });

  // Multiple compares deeply, single by identity: date-filter-select.vue rebuilds its ranges and
  // relies on re-picking an equal range still emitting.
  function isActiveItem(item: T): boolean {
    const itemValue = getItemValue(item);

    if (params.multiple.value) {
      return selectedValues.value.some((selectedValue) => isEqual(selectedValue, itemValue));
    }

    return itemValue === params.modelValue.value;
  }

  // An uninitialised model counts as empty.
  function getToggledValues(item: T): V[] {
    const itemValue = getItemValue(item);
    const existingIndex = selectedValues.value.findIndex((selectedValue) => isEqual(selectedValue, itemValue));

    if (existingIndex >= 0) {
      return [...selectedValues.value.slice(0, existingIndex), ...selectedValues.value.slice(existingIndex + 1)];
    }

    return [...selectedValues.value, itemValue];
  }

  const hasSelection = computed<boolean>(() => {
    if (params.multiple.value) {
      return selectedValues.value.length > 0;
    }

    return params.modelValue.value != null;
  });

  // Only a primitive has text to match; an unlabelled object would stringify to "[object Object]".
  function getFilterText(item: T): string {
    const text = getItemText(item);

    if (typeof text === "string") {
      return text.toLowerCase();
    }

    if (typeof text === "number" || typeof text === "bigint" || typeof text === "boolean") {
      return String(text).toLowerCase();
    }

    return "";
  }

  /** Substring match, with prefix matches hoisted to the top. */
  const filteredItems = computed<T[]>(() => {
    if (!params.filterValue.value || params.serverFilter?.value) {
      return params.items.value;
    }

    const searching = params.filterValue.value.toLowerCase();
    const matched = params.items.value.filter((item) => getFilterText(item).includes(searching));
    const prefixMatched = matched.filter((item) => getFilterText(item).startsWith(searching));

    return union(prefixMatched, matched);
  });

  return {
    getItemText,
    getItemValue,
    isActiveItem,
    getToggledValues,
    selectedItem,
    selectedValues,
    hasSelection,
    filteredItems,
  };
}
