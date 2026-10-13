import { isEqual, isObject, union } from "lodash-es";
import { computed, shallowRef, toValue, watch } from "vue";
import type { MaybeRefOrGetter } from "vue";

export interface IUseSelectOptions<T, V> {
  /** The options, in the order given. */
  items: MaybeRefOrGetter<T[]>;
  /**
   * The selected value, or the values in multiple mode; `undefined` is no selection, nor is a `null`
   * that neither an option nor the last match from an earlier `items` carries.
   */
  modelValue: MaybeRefOrGetter<V | V[] | undefined>;
  /** Several values instead of one. */
  multiple: MaybeRefOrGetter<boolean | undefined>;
  /** The typed query the options are filtered by. */
  filterValue: MaybeRefOrGetter<string>;
  /** When true the list is filtered by the consumer (server-side) and must pass through untouched. */
  serverFilter: MaybeRefOrGetter<boolean | undefined>;
  /** The option's label: a key or a getter; the option itself without one. */
  textField: MaybeRefOrGetter<VcSelectFieldAccessorType<T, string> | undefined>;
  /** The option's model value: a key or a getter; the option itself without one. */
  valueField: MaybeRefOrGetter<VcSelectFieldAccessorType<T, V> | undefined>;
}

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

/**
 * Selection state of VcSelect: reads labels and values through `textField` / `valueField`, matches
 * options against a single or multiple model, and filters the options locally unless `serverFilter`.
 */
export function useSelect<T, V>(params: IUseSelectOptions<T, V>) {
  function getItemText(item: T): unknown {
    return readField(item, toValue(params.textField));
  }

  function getItemValue(item: T): V {
    return readField(item, toValue(params.valueField)) as V;
  }

  /** The multiple-mode model: `valueField` values, or the items themselves without `valueField`; empty in single mode. */
  const selectedValues = computed<V[]>(() => {
    if (!toValue(params.multiple)) {
      return [];
    }

    const model = toValue(params.modelValue);

    return Array.isArray(model) ? model : [];
  });

  // An unset model matches nothing, not an option that lacks `valueField` and so reads `undefined`;
  // `null` is a value an option may carry.
  function isSingleModel(value: unknown): boolean {
    const model = toValue(params.modelValue);

    return model !== undefined && value === model;
  }

  const foundItem = computed<T | undefined>(() =>
    toValue(params.multiple) ? undefined : toValue(params.items).find((item) => isSingleModel(getItemValue(item))),
  );

  // Paging and server-filter replace `items`, and the next page may not carry the selection; its last
  // match keeps labelling it, and counting it as selected, for as long as the model still holds its value.
  const rememberedItem = shallowRef<{ value: V; item: T }>();

  watch(
    foundItem,
    (item) => {
      if (item !== undefined) {
        rememberedItem.value = { value: getItemValue(item), item };
      }
    },
    { immediate: true, flush: "sync" },
  );

  // Without `valueField` the model is the item, so an unmatched value is still handed back.
  const selectedItem = computed<T | undefined>(() => {
    const remembered =
      !toValue(params.multiple) && rememberedItem.value?.value === toValue(params.modelValue)
        ? rememberedItem.value?.item
        : undefined;

    const rawModelIsTheItem = !toValue(params.multiple) && toValue(params.valueField) === undefined;

    return (
      foundItem.value ?? remembered ?? (rawModelIsTheItem ? (toValue(params.modelValue) as T | undefined) : undefined)
    );
  });

  // A primitive is looked up, so a long list over a long selection stays linear; only objects are
  // compared deeply.
  const selectedPrimitives = computed(() => new Set<unknown>(selectedValues.value.filter((value) => !isObject(value))));
  const selectedObjects = computed(() => selectedValues.value.filter(isObject));

  // Multiple compares deeply, single by identity: date-filter-select.vue rebuilds its ranges and
  // relies on re-picking an equal range still emitting.
  function isActiveItem(item: T): boolean {
    const itemValue = getItemValue(item);

    if (toValue(params.multiple)) {
      return isObject(itemValue)
        ? selectedObjects.value.some((selectedValue) => isEqual(selectedValue, itemValue))
        : selectedPrimitives.value.has(itemValue);
    }

    return isSingleModel(itemValue);
  }

  function getToggledValues(item: T): V[] {
    const itemValue = getItemValue(item);
    const existingIndex = selectedValues.value.findIndex((selectedValue) => isEqual(selectedValue, itemValue));

    if (existingIndex >= 0) {
      return [...selectedValues.value.slice(0, existingIndex), ...selectedValues.value.slice(existingIndex + 1)];
    }

    return [...selectedValues.value, itemValue];
  }

  const hasSelection = computed<boolean>(() => {
    if (toValue(params.multiple)) {
      return selectedValues.value.length > 0;
    }

    const model = toValue(params.modelValue);

    // A clear commits `undefined`.
    if (model === undefined) {
      return false;
    }

    // An unset GraphQL value arrives as null, which is a selection only when an option carries it, on
    // this page or remembered from an earlier one.
    return model != null || foundItem.value !== undefined || rememberedItem.value?.value === model;
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

  const filteredItems = computed<T[]>(() => {
    if (!toValue(params.filterValue) || toValue(params.serverFilter)) {
      return toValue(params.items);
    }

    const searching = toValue(params.filterValue).toLowerCase();
    const matched = toValue(params.items).filter((item) => getFilterText(item).includes(searching));
    const prefixMatched = matched.filter((item) => getFilterText(item).startsWith(searching));

    return union(prefixMatched, matched);
  });

  return {
    /** The option's label, read through `textField`; the item itself without one. */
    getItemText,
    /** The option's model value, read through `valueField`; the item itself without one. */
    getItemValue,
    /** Whether the option is selected. */
    isActiveItem,
    /** The multiple-mode model with the option added, or removed when it was selected. */
    getToggledValues,
    /** Single mode: the selected option, remembered across paging; the model itself without `valueField`. */
    selectedItem,
    selectedValues,
    /** Whether the model holds a selection, so there is something to clear. */
    hasSelection,
    /** The options to render: substring matches with prefix matches first, or `items` as given. */
    filteredItems,
  };
}
