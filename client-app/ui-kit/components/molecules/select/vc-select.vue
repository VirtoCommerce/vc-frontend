<template>
  <div
    :id="componentId"
    :class="[
      'vc-select',
      {
        'vc-select--readonly': readonly,
        'vc-select--disabled': disabled,
        'vc-select--error': error,
        'vc-select--autocomplete': autocomplete,
        'vc-select--opened': isShown,
      },
    ]"
  >
    <VcLabel v-if="label" :for-id="triggerId" :required="required" :error="error">
      {{ label }}
    </VcLabel>

    <VcPopover
      ref="popoverElement"
      class="vc-select__container"
      tabindex="-1"
      :disabled="!enabled"
      :lazy="lazy"
      :teleport-selector="teleportSelector"
      :data-test-id="testIdDropdown"
      :width="dropdownWidth"
      placement="bottom-start"
      :offset-options="4"
      :z-index="10"
      @toggle="toggled"
    >
      <template #trigger="{ open, toggle, close }">
        <!-- `!= null`: an unset GraphQL value arrives as null, and without `valueField` the model is the item. -->
        <VcSelectButton
          v-if="$slots.selected || $slots.placeholder"
          ref="triggerElement"
          v-bind="triggerBindings"
          :selected-item="selectedSlotItem"
          :has-selection="multiple ? hasSelection : selected != null"
          @toggle="toggle"
          @clear="clear"
          @navigate="onNavigate($event, open)"
          @confirm="onConfirm($event, toggle, close)"
          @tab="onTab"
          @focusout="onFocusOut($event, close)"
        >
          <template v-if="$slots.selected" #selected="scope">
            <slot name="selected" :item="scope.item as M extends true ? V[] : T" :error="scope.error" />
          </template>

          <template v-if="$slots.placeholder" #placeholder="scope">
            <slot name="placeholder" v-bind="scope" />
          </template>
        </VcSelectButton>

        <VcSelectField
          v-else
          ref="triggerElement"
          v-bind="triggerBindings"
          :search="search"
          :placeholder-text="placeholderText ?? undefined"
          :autocomplete="autocomplete"
          @toggle="toggle"
          @open="open"
          @clear="clear"
          @navigate="onNavigate($event, open)"
          @confirm="onConfirm($event, toggle, close)"
          @tab="onTab"
          @update:search="onSearchInput($event, open)"
          @focusout="onFocusOut($event, close)"
        />
      </template>

      <template v-if="enabled" #content="{ close }">
        <div class="vc-select__dropdown" @focusout="onFocusOut($event, close)">
          <VcSelectAll
            v-if="showSelectAll"
            ref="selectAllElement"
            :checked="isAllSelected"
            :indeterminate="isSomeSelected"
            :accessible-label="selectAllLabel"
            :count="selectedOfTotal"
            @change="onSelectAll"
            @keydown.esc.stop="close()"
            @keydown.down.prevent="focusTrigger()"
          />

          <!-- Pointer use inside the list, the scrollbar included, keeps focus on the trigger. -->
          <VcScrollbar class="vc-select__scroll" vertical @mousedown.prevent>
            <!-- Only options may live in a listbox, so the pager sits beside the list, not in it. -->
            <ul
              :id="listboxId"
              ref="listElement"
              class="vc-select__list"
              role="listbox"
              :aria-label="accessibleLabel"
              :aria-multiselectable="multiple || undefined"
            >
              <!-- First, so a query being answered shows it above the previous query's options. -->
              <VcMenuItem v-if="showLoadingRow" role="option" :aria-selected="false" disabled :size="itemSize">
                <span class="vc-select__loading">
                  <slot name="loading">
                    <VcLoader />

                    <span class="sr-only">{{ $t("ui_kit.messages.loading_text") }}</span>
                  </slot>
                </span>
              </VcMenuItem>

              <VcMenuItem
                v-for="(item, index) in filteredItems"
                :key="index"
                :option-id="getOptionId(index)"
                :data-vc-select-option="componentId"
                :active="isActiveItem(item)"
                :highlighted="index === highlightedIndex"
                :highlight-ring="!isPassiveHighlight"
                :aria-selected="isActiveItem(item)"
                role="option"
                :size="itemSize"
                :tabindex="-1"
                @click="
                  select(item);
                  !multiple && close();
                "
                @mousemove="highlightPassively(index)"
              >
                <VcCheckbox
                  v-if="multiple"
                  :model-value="isActiveItem(item)"
                  :aria-label="toLabel(getItemText(item))"
                  tabindex="-1"
                />

                <slot name="item" v-bind="{ item, index }">
                  {{ getItemText(item) }}
                </slot>
              </VcMenuItem>

              <VcMenuItem
                v-if="!filteredItems.length && !loading"
                role="option"
                :aria-selected="false"
                disabled
                :size="itemSize"
              >
                <slot name="empty">
                  {{ $t(filterValue ? "ui_kit.messages.no_results" : "ui_kit.select.no_options") }}
                </slot>
              </VcMenuItem>
            </ul>

            <VcLoadMore
              class="vc-select__more"
              :loading="loading"
              :has-next-page="hasNextPage && !awaitingServerItems"
              @load-more="$emit('loadMore')"
            >
              <template v-if="$slots.loading" #loading>
                <slot name="loading" />
              </template>
            </VcLoadMore>
          </VcScrollbar>
        </div>
      </template>
    </VcPopover>

    <VcInputDetails
      :id="detailsId"
      :show-empty="showEmptyDetails"
      :message="message"
      :error="error"
      :single-line="singleLineMessage"
    />

    <span aria-live="polite" class="sr-only">{{ liveRegionMessage }}</span>
  </div>
</template>

<script setup lang="ts" generic="T, V = T, M extends boolean = false">
import { useDebounceFn, useElementBounding } from "@vueuse/core";
import { isEqual } from "lodash-es";
import { computed, getCurrentInstance, nextTick, ref, useTemplateRef, provide, toRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { vcPopoverKey } from "@/ui-kit/components/molecules/popover/vc-popover-context";
import { useComponentId, useListboxNavigation, useSelect } from "@/ui-kit/composables";
import { insertedText } from "@/ui-kit/utilities/text-diff";
import VcSelectAll from "./vc-select-all.vue";
import VcSelectButton from "./vc-select-button.vue";
import VcSelectField from "./vc-select-field.vue";
import type { ListboxNavigationKeyType } from "@/ui-kit/composables";

const emit = defineEmits<{
  (event: "update:modelValue", value: VcSelectEmittedType<V, M>): void;
  (event: "change", value: VcSelectEmittedType<V, M>): void;
  /**
   * Select all was pressed: `selected` is true when it selected, false when it cleared. Fires
   * alongside the model update, so a paged consumer can select or clear the options not loaded.
   * `query` is the text narrowing the list ("" for none): with one, the row acted on the matching
   * options only, so leave the rest of the selection alone — or, with `serverFilter`, add or clear
   * the query's matches.
   */
  (event: "selectAll", payload: { selected: boolean; query: string }): void;
  /** The list is resting at its end and more pages are available. */
  (event: "loadMore"): void;
  /** The typed query, debounced; an emptied query is sent at once. Pair with `serverFilter` to filter on the server. */
  (event: "search", value: string): void;
}>();

const props = withDefaults(
  defineProps<{
    modelValue?: M extends true ? V[] : V;
    label?: string;
    ariaLabel?: string;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    items: T[];
    size?: "xs" | "sm" | "md" | "auto";
    itemSize?: "xs" | "sm" | "md" | "lg";
    /** Property name, or an accessor, producing the option label. */
    textField?: VcSelectFieldAccessorType<T, string>;
    /** Property name, or an accessor, producing the model value. Defaults to the item itself. */
    // The accessor may infer the model type; only the key form must not. The rule resolves the key
    // type with T and V unknown, where it is `never`.
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    valueField?: VcSelectValueKeyType<T, NoInfer<V>> | ((item: T) => V);
    placeholder?: string;
    showEmptyDetails?: boolean;
    error?: boolean;
    message?: string;
    autocomplete?: boolean;
    singleLineMessage?: boolean;
    /** Allows several values; the model is then an array. */
    // `& boolean` keeps Vue's Boolean cast for a valueless attribute; the rule cannot see that.
    // eslint-disable-next-line sonarjs/no-useless-intersection
    multiple?: M & boolean;
    clearable?: boolean;
    /** Adds a Select all row above the options. Multiple mode only. */
    selectAll?: boolean;
    /**
     * Size of the whole set for the counter. Defaults to the number of options currently
     * rendered; pass it explicitly when the list is paged and `items` holds only one page.
     * With `server-filter`, it is the number of matches for the current query.
     */
    total?: number;
    /**
     * Selected matches among `total` while a `server-filter` query narrows a paged list, counting
     * matches that are not loaded. Defaults to the selected matches that are loaded. Capped at
     * `total`, except that it never falls below the selected matches that are loaded.
     */
    selectedCount?: number;
    /** Shows a loading indicator inside the list. */
    loading?: boolean;
    /**
     * More options exist beyond `items`. While it is set, the list asks for the next page with
     * `load-more` whenever it comes to rest at its bottom — including a page too short to scroll.
     * `loading` must be bound alongside it, or one request becomes many.
     */
    hasNextPage?: boolean;
    /**
     * Turns off client-side filtering — the consumer filters and re-supplies `items`. Answer every
     * `search` by replacing `items` or pushing/splicing into it while `loading` is off, or with a
     * `loading` cycle (changes inside an item do not count): until then the list holds paging back
     * and ignores Select all.
     */
    serverFilter?: boolean;
    testIdDropdown?: string;
    enableTeleport?: boolean;
    /** Defer rendering the option list until the dropdown is first opened (forwarded to VcPopover). */
    lazy?: boolean;
    /** Teleport target selector for the dropdown; defaults to the global popover host (forwarded to VcPopover). */
    teleportSelector?: string;
  }>(),
  {
    size: "md",
    itemSize: "sm",
  },
);

defineSlots<{
  /** The chosen item in single mode, the selected values in multiple mode. */
  selected?: (props: { item: M extends true ? V[] : T; error?: boolean }) => unknown;
  placeholder?: (props: { error?: boolean }) => unknown;
  item?: (props: { item: T; index: number }) => unknown;
  /** Replaces the loading indicator, for the first page and for every next one. */
  loading?: () => unknown;
  /** Replaces the text of the row shown when there are no options or no matches. */
  empty?: () => unknown;
}>();

provide(vcPopoverKey, { enableTeleport: toRef(() => props.enableTeleport ?? false) });

const { t } = useI18n();
const componentId = useComponentId("select");
const triggerId = componentId + "-trigger";
const detailsId = componentId + "-details";
const listboxId = componentId + "-listbox";
const triggerElement = useTemplateRef<{ focus: () => void }>("triggerElement");

// The dropdown matches the trigger's width.
const popoverElement = useTemplateRef<{ $el: HTMLElement }>("popoverElement");
const { width: triggerWidth } = useElementBounding(() => popoverElement.value?.$el ?? null);
const dropdownWidth = computed(() => `${triggerWidth.value}px`);

const accessibleLabel = computed(() => props.ariaLabel ?? props.label);

const isShown = ref(false);
const filterValue = ref("");
const {
  getItemText,
  isActiveItem,
  getItemValue,
  getToggledValues,
  selectedItem: selected,
  selectedValues,
  hasSelection,
  filteredItems,
} = useSelect<T, V>({
  items: toRef(() => props.items),
  modelValue: toRef(() => props.modelValue),
  multiple: toRef(() => props.multiple),
  filterValue,
  serverFilter: toRef(() => props.serverFilter),
  textField: toRef(() => props.textField),
  valueField: toRef(() => props.valueField),
});

const {
  highlightedIndex,
  isPassiveHighlight,
  getOptionId,
  navigate,
  highlight,
  highlightPassively,
  reset: resetHighlight,
} = useListboxNavigation({
  componentId,
  items: filteredItems,
  getKey: getItemValue,
  list: useTemplateRef<HTMLElement>("listElement"),
});

// Only announce an active option while the list is on screen.
const activeDescendantId = computed(() =>
  isShown.value && highlightedIndex.value >= 0 ? getOptionId(highlightedIndex.value) : undefined,
);

// With `serverFilter` the options on screen belong to the previous query until the consumer
// answers the query on screen with new items or finishes loading; their count would describe the
// wrong query. An answer that lands before the current query was even sent is the previous one's.
const awaitingServerItems = ref(false);
let searchedQuery = "";
// The items on screen answer this query; the first ones answer the empty one.
let answeredQuery = "";

// An answer belongs to the last query sent, whatever was typed since; it only ends the wait when
// that query is still the one on screen.
function onServerAnswer(): void {
  answeredQuery = searchedQuery;

  if (searchedQuery === filterValue.value) {
    awaitingServerItems.value = false;
  }
}

// A consumer need not fetch again for a query its items already answer, so sending one is its answer.
function sendSearch(value: string): void {
  searchedQuery = value;
  emit("search", value);

  if (value === answeredQuery) {
    awaitingServerItems.value = false;
  }
}

// Depth 1: an answer pushed or spliced into the same array counts as well as a new one. While
// `loading`, items emptied for the query are not its answer; the end of loading is.
watch(
  () => props.items,
  () => {
    if (!props.loading) {
      onServerAnswer();
    }
  },
  { deep: 1 },
);

watch(
  () => props.loading,
  (loading) => {
    if (!loading) {
      onServerAnswer();
    }
  },
);

const liveRegionMessage = computed(() => {
  if (!isShown.value || !filterValue.value || awaitingServerItems.value) {
    return "";
  }

  return filteredItems.value.length
    ? t("ui_kit.select.results_available", [filteredItems.value.length])
    : t("ui_kit.select.no_results_found");
});

function toLabel(value: unknown): string {
  return value === undefined || value === null ? "" : String(value);
}

const selectedText = computed<string | null>(() => {
  if (props.multiple) {
    return selectedValues.value.length ? t("ui_kit.select.items_selected", [selectedValues.value.length]) : null;
  }

  const text = selected.value === undefined ? undefined : getItemText(selected.value);

  // null, not "": an empty string would suppress the placeholder that `?? placeholder` provides.
  return text === undefined || text === null ? null : String(text);
});

const selectedSlotItem = computed(() => (props.multiple ? selectedValues.value : selected.value));

const placeholderText = computed(() => selectedText.value ?? props.placeholder);

const enabled = computed<boolean>(() => !props.readonly && !props.disabled);

const isClearButtonVisible = computed(() => {
  if (!props.clearable || props.disabled || props.readonly) {
    return false;
  }

  // In autocomplete mode when dropdown is open - show if there's filterValue or selection
  if (props.autocomplete && isShown.value) {
    return !!filterValue.value || hasSelection.value;
  }

  return hasSelection.value;
});

// Shared by both triggers; each adds its own.
const triggerBindings = computed(() => ({
  size: props.size,
  opened: isShown.value,
  clearVisible: isClearButtonVisible.value,
  disabled: props.disabled,
  readonly: props.readonly,
  error: props.error,
  required: props.required,
  accessibleLabel: accessibleLabel.value,
  triggerId,
  listboxId,
  detailsId,
  activeDescendantId: activeDescendantId.value,
}));

const search = computed({
  get() {
    if (props.autocomplete && isShown.value) {
      return filterValue.value;
    }

    return selectedText.value ?? "";
  },
  set(value) {
    filterValue.value = value;
  },
});

// `VcSelectEmittedType<V, M>` stays a deferred conditional type while `M` is unresolved, so the
// value needs a cast that the lint rule, judging the resolved type, calls unnecessary. The rule
// below reads the unconstrained `V` as `unknown`; the union names the three shapes a commit takes.
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
function commit(value: V | V[] | undefined): void {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  emit("update:modelValue", value as VcSelectEmittedType<V, M>);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  emit("change", value as VcSelectEmittedType<V, M>);
}

function select(item: T) {
  if (!enabled.value) {
    return;
  }

  if (props.multiple) {
    commit(getToggledValues(item));
    return;
  }

  // Re-picking the current value emits nothing.
  if (isActiveItem(item)) {
    return;
  }

  commit(getItemValue(item));
}

function onNavigate(key: ListboxNavigationKeyType, open: () => void) {
  if (!isShown.value) {
    open();

    // The list may not be rendered yet on the very first open (lazy popover).
    void nextTick(() => {
      if (!filteredItems.value.length) {
        return;
      }

      // APG: Down/Home open on the first option, Up/End on the last.
      const toLast = key === "end" || key === "up";

      navigate(toLast ? "end" : "home");
    });
    return;
  }

  navigate(key);
}

// Enter is consumed only when it opens a select-only list or accepts an option; otherwise a form owns it.
function onConfirm(event: KeyboardEvent, toggle: () => void, close: () => void) {
  if (!isShown.value) {
    if (props.autocomplete || !enabled.value) {
      return;
    }

    event.preventDefault();
    openedByKeyboard = true;
    toggle();
    return;
  }

  const item = filteredItems.value[highlightedIndex.value];

  if (item === undefined) {
    return;
  }

  event.preventDefault();
  select(item);

  if (!props.multiple) {
    close();
  }
}

// Set when Enter or Space opens the list, which then starts on the selection. Any other open (the
// pointer, typing) starts on nothing; the arrow keys and Home/End set their own start.
let openedByKeyboard = false;

function toggled(value: boolean) {
  isShown.value = value;

  if (isShown.value) {
    highlight(openedByKeyboard ? filteredItems.value.findIndex((item) => isActiveItem(item)) : -1);

    openedByKeyboard = false;
    return;
  }

  filterValue.value = "";
  resetHighlight();

  if (!focusLeft && holdsFocus()) {
    focusTrigger();
  }

  focusLeft = false;
}

// Focus returns to the trigger only if it is still ours (or nowhere): an outside click has already
// put it where the user aimed.
function holdsFocus(): boolean {
  const active = document.activeElement;

  if (!active || active === document.body) {
    return true;
  }

  return owns(active);
}

function owns(node: Node): boolean {
  // A teleported dropdown is not inside the root; the listbox id reaches it.
  const dropdown = document.getElementById(listboxId)?.closest(".vc-select__dropdown");

  return document.getElementById(componentId)?.contains(node) === true || dropdown?.contains(node) === true;
}

// Set while the list closes behind departing focus: activeElement is still <body> then, which
// `holdsFocus` would read as "ours" and pull focus back.
let focusLeft = false;

// Options are not tab stops, so Tab walks focus out of the select; the list closes behind it
// (APG). Focus that goes nowhere keeps it open: a click on the page is click-outside's to close.
function onFocusOut(event: FocusEvent, close: () => void): void {
  const next = event.relatedTarget;

  if (isShown.value && next instanceof Node && !owns(next)) {
    focusLeft = true;
    close();
  }
}

// Typing opens an autocomplete list (APG). Closed, the field shows the selection, so the keystroke
// starts a fresh query rather than editing that label.
function onSearchInput(value: string, open: () => void): void {
  if (!props.autocomplete || isShown.value) {
    filterValue.value = value;
    return;
  }

  open();
  filterValue.value = insertedText(selectedText.value ?? "", value);
}

function clear() {
  // In autocomplete mode - clear search first, then selection
  if (props.autocomplete && filterValue.value) {
    filterValue.value = "";
    return;
  }

  // Clear selection
  if (props.multiple && selectedValues.value.length) {
    commit([]);
  } else if (!props.multiple && hasSelection.value) {
    commit(undefined);
  }
}

function focusTrigger() {
  triggerElement.value?.focus();
}

// Clearing is sent at once; typing is debounced.
const SEARCH_DEBOUNCE_MS = 300;

// A query cleared before its debounce fired must not land after the clear.
const emitSearchDebounced = useDebounceFn((value: string) => {
  if (filterValue.value === value) {
    sendSearch(value);
  }
}, SEARCH_DEBOUNCE_MS);

watch(filterValue, (value) => {
  if (props.serverFilter) {
    // The options under the highlight stay the previous query's until the consumer answers.
    resetHighlight();
    awaitingServerItems.value = true;
  }

  if (value) {
    void emitSearchDebounced(value);
  } else {
    sendSearch("");
  }
});

// -----------------------------------------------------------------------------
// Select all
// -----------------------------------------------------------------------------

if (import.meta.env.DEV && props.selectAll && !props.multiple) {
  // eslint-disable-next-line no-console
  console.warn("VcSelect: `select-all` only applies to `multiple` selects and is ignored here.");
}

if (import.meta.env.DEV) {
  const vnodeProps = getCurrentInstance()?.vnode.props ?? {};

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

  if (props.serverFilter && !props.autocomplete) {
    // eslint-disable-next-line no-console
    console.warn("VcSelect: `server-filter` needs `autocomplete`; without it nothing can be typed.");
  }

  if (props.serverFilter && !vnodeProps.onSearch) {
    // eslint-disable-next-line no-console
    console.warn(
      "VcSelect: `server-filter` needs a `@search` handler for every query (not `.once`) that answers " +
        "with new `items` or a `loading` cycle; until then paging and Select all wait.",
    );
  }
}

// `multiple` with `valueField` used to store whole items; such a model now matches no option.
if (import.meta.env.DEV) {
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
    { immediate: true },
  );
}

const showSelectAll = computed(() => props.selectAll && props.multiple);

// The pager owns the spinner for a further page; a query on its way, or an empty first page, is shown
// here. A next page of the previous query is not asked for while its answer is pending.
const showLoadingRow = computed(
  () => props.loading && (awaitingServerItems.value || (!filteredItems.value.length && !props.hasNextPage)),
);

const selectableValues = computed(() => filteredItems.value.map((item) => getItemValue(item)));

const selectedVisibleCount = computed(
  () =>
    selectableValues.value.filter((value) => selectedValues.value.some((current) => isEqual(current, value))).length,
);

// While a query narrows the list, only the matching options count: a local filter is unknown to
// `total`, and with `server-filter` the consumer's `total` counts the matches.
const isNarrowed = computed(() => !!filterValue.value);

const totalCount = computed(() =>
  isNarrowed.value && !props.serverFilter ? filteredItems.value.length : (props.total ?? filteredItems.value.length),
);

const countedSelected = computed(() => {
  if (!isNarrowed.value) {
    return selectedValues.value.length;
  }

  if (!props.serverFilter || !Number.isFinite(props.selectedCount)) {
    return selectedVisibleCount.value;
  }

  // Capped at the number of matches, but never below what is visibly selected.
  return Math.max(Math.min(props.selectedCount!, totalCount.value), selectedVisibleCount.value);
});

const isEveryOptionSelected = computed(
  () => selectableValues.value.length > 0 && selectedVisibleCount.value === selectableValues.value.length,
);

// Checked means `n of n`: a fully selected page of a longer list is still partial.
const isAllSelected = computed(() => isEveryOptionSelected.value && countedSelected.value >= totalCount.value);

const isSomeSelected = computed(() => countedSelected.value > 0 && !isAllSelected.value);

const selectedOfTotal = computed(() =>
  t("ui_kit.select.selected_of_total", { selected: countedSelected.value, total: totalCount.value }),
);

const selectAllLabel = computed(() =>
  t("ui_kit.select.select_all_label", { selected: countedSelected.value, total: totalCount.value }),
);

// A partial list whose loaded options are all selected clears too: selecting would change nothing,
// and the pages it lacks are the consumer's to add on `selectAll`.
function onSelectAll() {
  // The options on screen still answer the previous query, which the event would misreport.
  if (awaitingServerItems.value) {
    return;
  }

  const clearing = isEveryOptionSelected.value;

  if (clearing) {
    // What a query hides stays selected; unnarrowed, the whole selection goes, loaded or not.
    const visible = selectableValues.value;
    commit(
      isNarrowed.value ? selectedValues.value.filter((value) => !visible.some((item) => isEqual(item, value))) : [],
    );
  } else {
    const merged = [...selectedValues.value];

    selectableValues.value.forEach((value) => {
      if (!merged.some((current) => isEqual(current, value))) {
        merged.push(value);
      }
    });

    commit(merged);
  }

  emit("selectAll", { selected: !clearing, query: filterValue.value });
}

const selectAllElement = useTemplateRef<{ focus: () => boolean }>("selectAllElement");

function onTab(event: KeyboardEvent) {
  if (!showSelectAll.value || !isShown.value || event.shiftKey) {
    return;
  }

  if (selectAllElement.value?.focus()) {
    event.preventDefault();
  }
}
</script>

<style lang="scss">
.vc-select {
  $scroll: "";

  --radius: var(--vc-select-radius, var(--vc-radius, 0.5rem));

  @apply flex flex-col;

  &__container {
    @apply relative rounded-[--radius];
  }

  // The card is the select's own: VcPopover only places it. May be teleported, so it declares its
  // own tokens.
  &__dropdown {
    --dropdown-max-height: var(--vc-select-dropdown-max-height, 12rem);
    --dropdown-radius: var(--vc-select-dropdown-radius, var(--vc-radius, 0.5rem));
    --dropdown-bg-color: var(--vc-select-dropdown-bg-color, var(--color-additional-50));

    @apply flex flex-col overflow-hidden rounded-[--dropdown-radius] bg-[--dropdown-bg-color] shadow-lg select-none;
  }

  &__scroll {
    $scroll: &;

    @apply max-h-[--dropdown-max-height] w-full;
  }

  // The dropdown clips its rounded corners, so the first and last options take its radius, or the
  // clip cuts their focus ring at rest. Select all sits above the list, VcLoadMore below it. An
  // option scrolled against a corner is still cut, as in VcDropdownMenu.
  &__list {
    @apply w-full divide-y divide-neutral-100;

    #{$scroll}:first-child & > :first-child {
      --vc-menu-item-radius: var(--dropdown-radius) var(--dropdown-radius) 0 0;
    }

    &:last-child > :last-child {
      --vc-menu-item-radius: 0 0 var(--dropdown-radius) var(--dropdown-radius);
    }

    #{$scroll}:first-child &:last-child > :only-child {
      --vc-menu-item-radius: var(--dropdown-radius);
    }
  }

  &__more {
    @apply border-t border-neutral-100;
  }

  &__loading {
    @apply flex w-full justify-center;
  }
}
</style>
