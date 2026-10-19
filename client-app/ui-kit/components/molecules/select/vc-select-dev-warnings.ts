import { isEqual, isObjectLike } from "lodash-es";
import { getCurrentInstance, watch } from "vue";
import { isSelectedCountKnown } from "@/ui-kit/composables";

interface IDevWarningProps<T> {
  items: T[];
  modelValue?: unknown;
  multiple?: boolean;
  valueField?: unknown;
  selectAll?: boolean;
  total?: number;
  selectedCount?: number;
  hasNextPage?: boolean;
  serverFilter?: boolean;
  autocomplete?: boolean;
}

interface IDevWarningSlots {
  selected?: unknown;
  placeholder?: unknown;
}

type VNodePropsType = Record<string, unknown>;

/** Console warnings for VcSelect props that contradict each other. Call it during setup, in dev only. */
export function useSelectDevWarnings<T>(
  props: IDevWarningProps<T>,
  slots: IDevWarningSlots,
  getItemValue: (item: T) => unknown,
): void {
  const vnodeProps = getCurrentInstance()?.vnode.props ?? {};

  warnSelectAll(props, vnodeProps);
  warnFiltering(props, slots, vnodeProps);
  warnPaging(props, slots, vnodeProps);
  watchItemModel(props, getItemValue);
  watchPrimitiveModel(props);
}

function warnSelectAll<T>(props: IDevWarningProps<T>, vnodeProps: VNodePropsType): void {
  if (props.selectAll && !props.multiple) {
    // eslint-disable-next-line no-console
    console.warn("VcSelect: `select-all` only applies to `multiple` selects and is ignored here.");
  }

  // A paged list's Select all can only add what is loaded; the rest of the set is the consumer's.
  // Truthy, not present: `@select-all="undefined"` handles nothing. `.once` is not exempt either — a
  // paged list needs the handler on every press.
  if (props.selectAll && props.multiple && !vnodeProps.onSelectAll) {
    let warnedPaged = false;

    watch(
      () => props.hasNextPage || (props.total ?? 0) > props.items.length,
      (paged) => {
        if (paged && !warnedPaged) {
          warnedPaged = true;
          // eslint-disable-next-line no-console
          console.warn(
            "VcSelect: a paged `select-all` without a `@select-all` handler selects only the loaded " +
              "options; add the rest of the set in `@select-all`.",
          );
        }
      },
      { immediate: true },
    );
  }

  if (props.selectedCount !== undefined && !(props.multiple && props.selectAll)) {
    // eslint-disable-next-line no-console
    console.warn("VcSelect: `selected-count` only counts for `multiple` + `select-all`; it is ignored here.");
  }

  watchUncountedSelectAll(props);

  if (
    !("select-all" in vnodeProps || "selectAll" in vnodeProps) &&
    (props.total !== undefined || vnodeProps.onSelectAll)
  ) {
    // eslint-disable-next-line no-console
    console.warn("VcSelect: `total` and `@select-all` belong to the Select all row; add `select-all`.");
  }
}

// Without the count a fully selected page cannot be told from the whole set, so the row clears there
// instead of asking for the rest.
function watchUncountedSelectAll<T>(props: IDevWarningProps<T>): void {
  if (!(props.selectAll && props.multiple)) {
    return;
  }

  let warnedUncounted = false;

  watch(
    () =>
      !isSelectedCountKnown(props.selectedCount) &&
      ((props.total ?? 0) > props.items.length || (!!props.serverFilter && props.total !== undefined)),
    (uncounted) => {
      if (uncounted && !warnedUncounted) {
        warnedUncounted = true;
        // eslint-disable-next-line no-console
        console.warn(
          "VcSelect: a paged `select-all` needs `selected-count` to select the rest — the selected options, " +
            "and under a `server-filter` query the selected matches among `total`; without it a fully selected " +
            "page clears.",
        );
      }
    },
    { immediate: true },
  );
}

function warnFiltering<T>(props: IDevWarningProps<T>, slots: IDevWarningSlots, vnodeProps: VNodePropsType): void {
  if (props.autocomplete && (slots.selected || slots.placeholder)) {
    // eslint-disable-next-line no-console
    console.warn(
      "VcSelect: `autocomplete` has no input with a `#selected` or `#placeholder` trigger; nothing can be typed.",
    );
  }

  if (props.serverFilter && !props.autocomplete) {
    // eslint-disable-next-line no-console
    console.warn("VcSelect: `server-filter` needs `autocomplete`; without it nothing can be typed.");
  }

  if (props.serverFilter && !vnodeProps.onSearch) {
    // eslint-disable-next-line no-console
    console.warn(
      "VcSelect: `server-filter` needs a `@search` handler for every query (not `.once`) that answers " +
        "with new `items`, holding `loading` while it fetches.",
    );
  }
}

function warnPaging<T>(props: IDevWarningProps<T>, slots: IDevWarningSlots, vnodeProps: VNodePropsType): void {
  if ("has-next-page" in vnodeProps || "hasNextPage" in vnodeProps) {
    if (!("loading" in vnodeProps)) {
      // eslint-disable-next-line no-console
      console.warn("VcSelect: `has-next-page` needs `loading` bound, or a page still loading is asked for again.");
    }

    // Truthy, not present, as for `@select-all`.
    if (!vnodeProps.onLoadMore) {
      // eslint-disable-next-line no-console
      console.warn("VcSelect: `has-next-page` needs a `@load-more` handler that appends the next page.");
    }
  }

  // A local filter sees only loaded options: with `total` above them a match outside them never shows,
  // and with `has-next-page` a query pages through the whole set. A slotted trigger has no input to type a query into.
  let warnedLocalFilter = false;

  watch(
    () =>
      props.autocomplete &&
      !props.serverFilter &&
      !(slots.selected || slots.placeholder) &&
      (props.hasNextPage || (props.total ?? 0) > props.items.length),
    (filtersPagesLocally) => {
      if (filtersPagesLocally && !warnedLocalFilter) {
        warnedLocalFilter = true;
        // eslint-disable-next-line no-console
        console.warn(
          "VcSelect: `autocomplete` on a paged list filters on the client: only the loaded options, or every " +
            "page in turn with `has-next-page`; add `server-filter`.",
        );
      }
    },
    { immediate: true },
  );
}

// A `multiple` model holding whole items instead of `valueField` values matches no option.
function watchItemModel<T>(props: IDevWarningProps<T>, getItemValue: (item: T) => unknown): void {
  let warnedItemModel = false;

  watch(
    () => [props.multiple, props.valueField, props.modelValue, props.items] as const,
    ([multiple, valueField, modelValue, items]) => {
      if (warnedItemModel || !multiple || valueField === undefined || !Array.isArray(modelValue)) {
        return;
      }

      // An off-page selection matches no loaded item, but still carries a string value field as a key.
      const holdsItems = modelValue.some(
        (value) =>
          (typeof valueField === "string" && typeof value === "object" && value !== null && valueField in value) ||
          items.some((item) => isEqual(item, value) && !isEqual(getItemValue(item), value)),
      );

      if (holdsItems) {
        warnedItemModel = true;
        // eslint-disable-next-line no-console
        console.warn(
          "VcSelect: with `multiple` and `value-field` the model holds values, not items. " +
            "Map the items to their `value-field`, or drop `value-field` to keep whole items.",
        );
      }
    },
    // Depth 2: the tuple, then the entries of items and of the model, so a push, a splice or an
    // index assignment in place re-runs the check.
    { immediate: true, deep: 2 },
  );
}

// Without `valueField` the model is the item itself, so a primitive model over object items matches
// no option and the whole item is what a pick writes into it.
function watchPrimitiveModel<T>(props: IDevWarningProps<T>): void {
  let warnedPrimitiveModel = false;

  watch(
    () => [props.valueField, props.modelValue, props.items] as const,
    ([valueField, modelValue, items]) => {
      if (warnedPrimitiveModel || valueField !== undefined) {
        return;
      }

      const values: unknown[] = Array.isArray(modelValue) ? modelValue : [modelValue];
      // A primitive that is itself one of the items (mixed items) is a valid model.
      const holdsPrimitive = values.some(
        (value) => value !== null && value !== undefined && typeof value !== "object" && !items.includes(value as T),
      );
      const offersObjects = items.some((item) => isObjectLike(item));

      if (holdsPrimitive && offersObjects) {
        warnedPrimitiveModel = true;
        // eslint-disable-next-line no-console
        console.warn(
          "VcSelect: the model holds a primitive but the items are objects, and without `value-field` " +
            "the model is the item. Set `value-field` to the key the model holds.",
        );
      }
    },
    { immediate: true, deep: 2 },
  );
}
