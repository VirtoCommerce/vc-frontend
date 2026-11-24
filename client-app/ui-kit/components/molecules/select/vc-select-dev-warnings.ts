import { isObjectLike } from "lodash-es";
import { getCurrentInstance, watch } from "vue";
import { isSelectedCountKnown } from "@/ui-kit/composables";
import type { ComponentInternalInstance } from "vue";

interface IDevWarningProps<T> {
  items: T[];
  modelValue?: unknown;
  multiple?: boolean;
  valueField?: unknown;
  withSelectAll?: boolean;
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
export function useSelectDevWarnings<T>(props: IDevWarningProps<T>, slots: IDevWarningSlots): void {
  const instance = getCurrentInstance();
  const vnodeProps = instance?.vnode.props ?? {};

  warnSelectAll(props, instance);
  warnFiltering(props, slots, instance);
  warnPaging(props, slots, vnodeProps);
  watchPrimitiveModel(props);
}

function createWarnOnce(): (message: string) => void {
  const warned = new Set<string>();

  return (message) => {
    if (!warned.has(message)) {
      warned.add(message);
      // eslint-disable-next-line no-console
      console.warn(message);
    }
  };
}

// The props can be switched after mount; the instance's current vnode holds the ones bound now.
function warnSelectAll<T>(props: IDevWarningProps<T>, instance: ComponentInternalInstance | null): void {
  const warnOnce = createWarnOnce();

  watch(
    () =>
      [
        props.withSelectAll,
        props.multiple,
        props.selectedCount,
        props.total,
        props.serverFilter,
        props.hasNextPage,
        props.items.length,
      ] as const,
    ([withSelectAll, multiple, selectedCount, total, serverFilter, hasNextPage, itemCount]) => {
      const vnodeProps: VNodePropsType = instance?.vnode.props ?? {};
      const hasRow = "with-select-all" in vnodeProps || "withSelectAll" in vnodeProps;
      const isRowShown = !!withSelectAll && !!multiple;

      if (withSelectAll && !multiple) {
        warnOnce("VcSelect: `with-select-all` only applies to `multiple` selects and is ignored here.");
      }

      // A paged list's Select all can only add what is loaded; the rest of the set is the consumer's.
      // Truthy, not present: `@select-all="undefined"` handles nothing. `.once` is not exempt either — a
      // paged list needs the handler on every press.
      if (isRowShown && !vnodeProps.onSelectAll && (hasNextPage || (total ?? 0) > itemCount)) {
        warnOnce(
          "VcSelect: a paged `with-select-all` without a `@select-all` handler selects only the loaded " +
            "options; add the rest of the set in `@select-all`.",
        );
      }

      if (selectedCount !== undefined && !isRowShown) {
        warnOnce("VcSelect: `selected-count` only counts for `multiple` + `with-select-all`; it is ignored here.");
      }

      // Without the count a fully selected page cannot be told from the whole set, so the row clears there
      // instead of asking for the rest.
      if (
        isRowShown &&
        !isSelectedCountKnown(selectedCount) &&
        ((total ?? 0) > itemCount || (!!serverFilter && total !== undefined))
      ) {
        warnOnce(
          "VcSelect: a paged `with-select-all` needs `selected-count` to select the rest — the selected options, " +
            "and under a `server-filter` query the selected matches among `total`; without it a fully selected " +
            "page clears.",
        );
      }

      // Under `server-filter` the announced result count reads `total` too.
      if (!hasRow && ((total !== undefined && !serverFilter) || vnodeProps.onSelectAll)) {
        warnOnce(
          "VcSelect: `@select-all`, and `total` outside `server-filter`, belong to the Select all row; add `with-select-all`.",
        );
      }
    },
    { immediate: true },
  );
}

function warnFiltering<T>(
  props: IDevWarningProps<T>,
  slots: IDevWarningSlots,
  instance: ComponentInternalInstance | null,
): void {
  if (props.autocomplete && (slots.selected || slots.placeholder)) {
    // eslint-disable-next-line no-console
    console.warn(
      "VcSelect: `autocomplete` has no input with a `#selected` or `#placeholder` trigger; nothing can be typed.",
    );
  }

  const warnOnce = createWarnOnce();

  // `server-filter` can be switched after mount; the instance's current vnode holds the props bound now.
  watch(
    () => [props.serverFilter, props.autocomplete] as const,
    ([serverFilter, autocomplete]) => {
      const vnodeProps: VNodePropsType = instance?.vnode.props ?? {};
      // Present, not truthy: "" answers the unfiltered list, and an echo may start undefined.
      const hasAnsweredQuery = "answeredQuery" in vnodeProps || "answered-query" in vnodeProps;

      if (serverFilter && !autocomplete) {
        warnOnce("VcSelect: `server-filter` needs `autocomplete`; without it nothing can be typed.");
      }

      if (serverFilter && !vnodeProps.onSearch) {
        warnOnce(
          "VcSelect: `server-filter` needs a `@search` handler for every query (not `.once`) that answers " +
            "with new `items`, holding `loading` while it fetches.",
        );
      }

      if (serverFilter && !hasAnsweredQuery) {
        warnOnce(
          "VcSelect: `server-filter` needs `answered-query`, the query your `items` answer; without it only the " +
            "unfiltered list counts as answered, so under a typed query Select all stays disabled and no result " +
            "count is announced.",
        );
      }

      if (!serverFilter && hasAnsweredQuery) {
        warnOnce(
          "VcSelect: `answered-query` needs `server-filter`; without it the select filters on the client and " +
            "ignores the echo, so Select all and the result count follow the loaded options, not your query.",
        );
      }
    },
    { immediate: true },
  );
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

// A model is the item itself in multiple mode, and in single mode without `valueField`; there a primitive
// over object items matches no option, and the whole item is what a pick writes into it.
function watchPrimitiveModel<T>(props: IDevWarningProps<T>): void {
  let warnedPrimitiveModel = false;

  watch(
    () => [props.multiple, props.valueField, props.modelValue, props.items] as const,
    ([multiple, valueField, modelValue, items]) => {
      if (warnedPrimitiveModel || (!multiple && valueField !== undefined)) {
        return;
      }

      const values: unknown[] = Array.isArray(modelValue) ? modelValue : [modelValue];
      // A primitive that is itself one of the items (mixed items) is a valid model.
      const hasPrimitiveValue = values.some(
        (value) => value !== null && value !== undefined && typeof value !== "object" && !items.includes(value as T),
      );
      const hasObjectItems = items.some((item) => isObjectLike(item));

      if (!hasPrimitiveValue || !hasObjectItems) {
        return;
      }

      warnedPrimitiveModel = true;
      // eslint-disable-next-line no-console
      console.warn(
        multiple
          ? "VcSelect: a `multiple` model holds items, not `value-field` values, but this one holds a primitive " +
              "while the items are objects, so it matches no option. Put the items themselves in the model."
          : "VcSelect: the model holds a primitive but the items are objects, and without `value-field` " +
              "the model is the item. Set `value-field` to the key the model holds.",
      );
    },
    // Depth 2: the tuple, then the entries of items and of the model, so a push, a splice or an
    // index assignment in place re-runs the check.
    { immediate: true, deep: 2 },
  );
}
