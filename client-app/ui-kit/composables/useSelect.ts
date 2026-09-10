import { isEqual, union } from "lodash-es";
import { computed } from "vue";
import type { Ref } from "vue";

type ParamsType<T, V> = {
  items: Ref<T[]>;
  modelValue: Ref<V | V[] | undefined>;
  multiple: Ref<boolean | undefined>;
  filterValue: Ref<string>;
  textField?: Ref<VcSelectFieldAccessorType<T, string> | undefined>;
  valueField?: Ref<VcSelectFieldAccessorType<T, V> | undefined>;
};

// `!item` rather than a null check: the pre-refactor accessor was `textField && item ? … : item`,
// so a falsy option (0, "", false) resolves to itself instead of being indexed. It also keeps a
// null item from throwing, which the old code did when `valueField` was set.
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

  /**
   * The item behind a single-mode model value. Without `valueField` the model IS the item,
   * so a value that matches nothing in `items` is still handed back — dropping it would stop
   * the `#selected` slot rendering for anyone whose model outlives its options list.
   */
  const selectedItem = computed<T | undefined>(() => {
    const found = params.multiple.value
      ? undefined
      : params.items.value.find((item) => getItemValue(item) === params.modelValue.value);

    const rawModelIsTheItem = !params.multiple.value && params.valueField?.value === undefined;

    return found ?? (rawModelIsTheItem ? (params.modelValue.value as T | undefined) : undefined);
  });

  /**
   * Comparison depth is per mode, exactly as before the refactor: multiple compares deeply,
   * single compares by identity. Making single deep looks tidier but swallows a legitimate
   * re-pick — `date-filter-select.vue` rebuilds its ranges on locale change, and re-picking
   * the same range must still emit so the component can reset its validity flags.
   */
  function isActiveItem(item: T): boolean {
    const itemValue = getItemValue(item);

    if (params.multiple.value) {
      return selectedValues.value.some((selectedValue) => isEqual(selectedValue, itemValue));
    }

    return itemValue === params.modelValue.value;
  }

  /**
   * Model after toggling `item` in multiple mode. An uninitialised model counts as empty,
   * so the array shape is preserved instead of falling through to single-select behaviour.
   */
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

  /** Substring match, with prefix matches hoisted to the top. */
  const filteredItems = computed<T[]>(() => {
    if (!params.filterValue.value) {
      return params.items.value;
    }

    const searching = params.filterValue.value.toLowerCase();
    const matched = params.items.value.filter((item) =>
      String(getItemText(item) ?? "")
        .toLowerCase()
        .includes(searching),
    );

    const prefixMatched = matched.filter((item) =>
      String(getItemText(item) ?? "")
        .toLowerCase()
        .startsWith(searching),
    );

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
