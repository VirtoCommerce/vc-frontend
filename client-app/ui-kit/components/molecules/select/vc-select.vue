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
            <slot name="selected" :item="scope.item as M extends true ? T[] : T" :error="scope.error" />
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
          :placeholder-text="placeholderText"
          :autocomplete="autocomplete"
          @toggle="toggle"
          @open="open"
          @clear="clear"
          @navigate="onNavigate($event, open)"
          @confirm="onConfirm($event, toggle, close)"
          @tab="onTab"
          @update:search="onSearchInput($event, open)"
          @beforeinput="onBeforeSearchInput"
          @focusout="onFocusOut($event, close)"
        />
      </template>

      <template v-if="enabled" #content="{ close }">
        <!-- A mousedown anywhere in the dropdown, the scrollbar included, does not move focus. -->
        <div class="vc-select__dropdown" @mousedown.prevent @focusout="onFocusOut($event, close)">
          <VcSelectAll
            v-if="isSelectAllShown"
            ref="selectAllElement"
            :checked="isAllSelected"
            :indeterminate="isSomeSelected"
            :accessible-label="selectAllLabel"
            :count="selectedOfTotal"
            :disabled="isSelectAllDisabled"
            @change="onSelectAll"
            @keydown.esc.stop="close()"
            @keydown.down.prevent="focusTrigger()"
            @keydown.tab="onSelectAllTab"
          />

          <VcScrollbar class="vc-select__scroll" vertical>
            <!-- Only options may live in a listbox, so the pager sits beside the list, not in it. -->
            <ul
              :id="listboxId"
              ref="listElement"
              :class="['vc-select__list', { 'vc-select__list--paging': isPagerSpinnerShown }]"
              role="listbox"
              :aria-label="accessibleLabel"
              :aria-multiselectable="multiple || undefined"
            >
              <!-- First, so a query being answered shows it above the previous query's options. -->
              <VcMenuItem
                v-if="isLoadingRowShown"
                role="option"
                :aria-selected="false"
                disabled
                :size="itemSize"
                :tabindex="-1"
                with-divider
              >
                <span class="vc-select__loading">
                  <slot name="loader">
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
                :active="activeRows[index]"
                :highlighted="index === highlightedIndex"
                :highlight-ring="!isPassiveHighlight"
                :aria-selected="activeRows[index]"
                role="option"
                :size="itemSize"
                :tabindex="-1"
                with-divider
                @click="pick(item, close)"
                @mousemove="highlightPassively(index)"
              >
                <VcCheckbox
                  v-if="multiple"
                  :model-value="activeRows[index]"
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
                :tabindex="-1"
                with-divider
              >
                <slot name="empty">
                  {{ $t(filterValue ? "ui_kit.messages.no_results" : "ui_kit.select.no_options") }}
                </slot>
              </VcMenuItem>
            </ul>

            <VcLoadMore
              :loading="loading"
              :has-next-page="hasPageToLoad"
              :item-count="items.length"
              @load-more="$emit('loadMore')"
            >
              <template v-if="$slots.loader" #loader>
                <slot name="loader" />
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
import { useDebounceFn, useElementSize } from "@vueuse/core";
import { computed, nextTick, ref, useTemplateRef, provide, toRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { vcPopoverKey } from "@/ui-kit/components/molecules/popover/vc-popover-context";
import { useComponentId, useListboxNavigation, useSelect, useSelectAll } from "@/ui-kit/composables";
import { FOCUSABLE_CONTENT_SELECTOR, hasNegativeTabindex, insertedText } from "@/ui-kit/utilities";
import VcSelectAll from "./vc-select-all.vue";
import VcSelectButton from "./vc-select-button.vue";
import { useSelectDevWarnings } from "./vc-select-dev-warnings";
import VcSelectField from "./vc-select-field.vue";
import type { ListboxNavigationKeyType } from "@/ui-kit/composables";

const emit = defineEmits<{
  (event: "update:modelValue", value: VcSelectEmittedType<T, V, M>): void;
  (event: "change", value: VcSelectEmittedType<T, V, M>): void;
  /**
   * Select all was pressed: `action` is `select-all` when it selected, `deselect-all` when it cleared.
   * Fires alongside the model update, so a paged consumer can select or clear the options not loaded.
   * `query` is the text narrowing the list ("" for none): with one, the row acted on the matching
   * options only, so leave the rest of the selection alone — or, with `serverFilter`, add or clear
   * the query's matches.
   */
  (event: "selectAll", payload: VcSelectSelectAllPayloadType): void;
  /** The list is resting at its end and more pages are available. */
  (event: "loadMore"): void;
  /** The typed query, debounced; an emptied query is sent at once. Pair with `serverFilter` to filter on the server. */
  (event: "search", value: string): void;
}>();

const props = withDefaults(
  defineProps<{
    /** The selected value, or in `multiple` mode the selected items, whatever `value-field` says. */
    modelValue?: M extends true ? NoInfer<T>[] : V;
    label?: string;
    ariaLabel?: string;
    /** Draws the label's asterisk and exposes `aria-required` on the trigger. No native validation. */
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    items: T[];
    size?: "xs" | "sm" | "md" | "auto";
    itemSize?: "xs" | "sm" | "md" | "lg";
    /** Property name, or an accessor, producing the option label. */
    textField?: VcSelectFieldAccessorType<T, string>;
    /**
     * Property name, or an accessor, producing the single-mode model value. In `multiple` mode the model
     * holds items, and this is what an item is matched by. Defaults to the item itself.
     */
    // The accessor may infer the model type; only the key form must not. A multiple model of items
    // fits any key, though TypeScript also infers V from it as the array. The rule resolves the key
    // type with T and V unknown, where it is `never`.
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    valueField?: VcSelectValueKeyType<T, M extends true ? T : NoInfer<V>> | ((item: T) => V);
    placeholder?: string;
    showEmptyDetails?: boolean;
    error?: boolean;
    message?: string;
    autocomplete?: boolean;
    singleLineMessage?: boolean;
    /**
     * Allows several selections; the model is then an array of items. An item is matched by its `value-field`
     * value, or by the item itself without one: primitives are looked up, objects compared deeply — for
     * thousands of options over thousands of selections, pick a primitive `value-field`.
     */
    // `& boolean` keeps Vue's Boolean cast for a valueless attribute; the rule cannot see that.
    // eslint-disable-next-line sonarjs/no-useless-intersection
    multiple?: M & boolean;
    clearable?: boolean;
    /** Adds a Select all row above the options. Multiple mode only. */
    withSelectAll?: boolean;
    /**
     * With `with-select-all`: the size of the whole set for the row's counter. Defaults to the number of
     * options currently rendered; pass it explicitly when the list is paged and `items` holds only one page.
     * With `server-filter`, it is the number of matches for the current query, and the result count
     * announced for it, with or without the row.
     */
    total?: number;
    /**
     * Binding it says you complete the set on `@select-all`, for a paged `with-select-all` (`total`
     * above the loaded options, or `server-filter`): a row whose loaded options are all selected then
     * stays partial, and a press reports `select-all` for you to add the rest. Without it such a page
     * shows checked and a press clears, since the row cannot tell it from the whole selection.
     * Its value counts while a `server-filter` query narrows the list: the selected matches among
     * `total`, loaded or not. Unfiltered the counter counts the model, which holds every selected item.
     * Capped at `total`, never below the selected matches that are loaded.
     */
    selectedCount?: number;
    /**
     * Shows the list's loading indicator: for the first page, a next one, or a `server-filter` answer.
     * It does not say which query `items` answer — `answered-query` does.
     */
    loading?: boolean;
    /**
     * More options exist beyond `items`. While it is set, the list asks for the next page with
     * `load-more` whenever it comes to rest at its bottom — including a page too short to scroll.
     * `loading` must be bound alongside it, or one request becomes many. A page that fails is not
     * asked for again while the list rests at its end: scrolling away and back retries it, or call
     * the loader again yourself (a short list cannot scroll).
     */
    hasNextPage?: boolean;
    /**
     * Turns off client-side filtering: answer each `search` with new `items` (and `total`) and echo the
     * query they answer in `answered-query`. Needs `autocomplete`.
     */
    serverFilter?: boolean;
    /**
     * With `server-filter`: the query the current `items` and `total` answer, echoed back. Until it
     * matches the last `search` (spaces around either ignored), Select all is disabled, keeps counting
     * the answered query, and no result count is announced. Echo a query you skip (too short) at once.
     * On an error show no `items`: Apollo keeps the previous result. With Apollo `useQuery`, bind
     * `useAnsweredQuery(useQueryReturn, (variables) => variables?.keyword)` from `@vc-frontend/core`
     * (host code: `core/api/graphql/composables`).
     * Not `loading.value ? prev : variables.value.keyword`: it names the new query before its result is in.
     */
    answeredQuery?: string;
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

const slots = defineSlots<{
  /**
   * The chosen item in single mode, the selected items in multiple mode. With this slot or
   * `#placeholder` the trigger is a button, not a typable field, so `autocomplete` has no input.
   */
  selected?: (props: { item: M extends true ? T[] : T; error?: boolean }) => unknown;
  /** Shown in the slotted trigger while nothing is selected; like `#selected`, it makes the trigger a button. */
  placeholder?: (props: { error?: boolean }) => unknown;
  /** Replaces the label of one option. */
  item?: (props: { item: T; index: number }) => unknown;
  /** Replaces the loading indicator, for the first page and for every next one. */
  loader?: () => unknown;
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

const popoverElement = useTemplateRef<{ $el: HTMLElement }>("popoverElement");
// A ResizeObserver only: unlike useElementBounding, no window scroll listener per select.
const { width: triggerWidth } = useElementSize(() => popoverElement.value?.$el ?? null, undefined, {
  box: "border-box",
});
const dropdownWidth = computed(() => `${triggerWidth.value}px`);

const accessibleLabel = computed(() => props.ariaLabel ?? props.label);

const isShown = ref(false);

// Plain variables, not refs: nothing renders them.
// Set when Enter or Space opens the list, which then starts on the selection. Any other open (the
// pointer, typing) starts on nothing; the arrow keys and Home/End set their own start.
let openedByKeyboard = false;

// Set while the list closes behind departing focus: activeElement is still <body> then, which
// `holdsFocus` would read as "ours" and pull focus back.
let focusLeft = false;

// The selection a keystroke is about to replace; Tab selects the whole label. Kept until the list
// opens, not read once: maska delivers each keystroke twice, and the open may land in between.
let replacedRange: [number, number] | undefined;

const filterValue = ref("");
const {
  getItemText,
  isActiveItem,
  isSameItem,
  getItemValue,
  getToggledItems,
  selectedItem: selected,
  selectedItems,
  hasSelection,
  filteredItems,
} = useSelect<T, V>({
  items: () => props.items,
  modelValue: () => props.modelValue,
  multiple: () => props.multiple,
  filterValue,
  serverFilter: () => props.serverFilter,
  textField: () => props.textField,
  valueField: () => props.valueField,
});

// Once per change of the list or the selection, not per row and render: a pointer highlight
// re-renders every row.
const activeRows = computed(() => filteredItems.value.map((item) => isActiveItem(item)));

const {
  highlightedIndex,
  isPassiveHighlight,
  activeDescendantId: highlightedOptionId,
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
  // Past the last loaded option comes the next page, not the first option.
  wrap: () => !props.hasNextPage,
});

const activeDescendantId = computed(() => (isShown.value ? highlightedOptionId.value : undefined));

// With `serverFilter`, the options on screen answer the query the consumer echoes; until it echoes the
// one sent, and while a typed one waits for its debounce, they answer an earlier query.
const sentQuery = ref("");
const isQueryPending = computed(() => !!props.serverFilter && filterValue.value !== sentQuery.value);

// Spaces around a query are not compared: a consumer that trims echoes the trimmed text.
const echoedQuery = computed(() => (props.answeredQuery ?? "").trim());

const isAnswerPending = computed(
  () => isQueryPending.value || (!!props.serverFilter && sentQuery.value.trim() !== echoedQuery.value),
);

function sendSearch(value: string): void {
  sentQuery.value = value;
  emit("search", value);
}

// Switched on, the query typed under the local filter has to reach the server.
watch(
  () => props.serverFilter,
  (serverFilter) => {
    if (serverFilter && filterValue.value) {
      sendSearch(filterValue.value);
    }
  },
);

const liveRegionMessage = computed(() => {
  // An emptied list that is loading has no results to count yet.
  if (!isShown.value || !filterValue.value || isAnswerPending.value || (props.loading && !filteredItems.value.length)) {
    return "";
  }

  // A server-side query's matches, as Select all counts them, not just the options loaded so far.
  const count = props.serverFilter ? (props.total ?? filteredItems.value.length) : filteredItems.value.length;

  return count ? t("ui_kit.select.results_available", [count]) : t("ui_kit.select.no_results_found");
});

function toLabel(value: unknown): string {
  return value === undefined || value === null ? "" : String(value);
}

const selectedText = computed<string | null>(() => {
  if (props.multiple) {
    return selectedItems.value.length ? t("ui_kit.select.items_selected", [selectedItems.value.length]) : null;
  }

  const text = selected.value === undefined ? undefined : getItemText(selected.value);

  // null, not "": an empty string would suppress the placeholder that `?? placeholder` provides.
  return text === undefined || text === null ? null : String(text);
});

const selectedSlotItem = computed(() => (props.multiple ? selectedItems.value : selected.value));

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

// `VcSelectEmittedType<T, V, M>` stays a deferred conditional type while `M` is unresolved, so the
// value needs a cast that the lint rule, judging the resolved type, calls unnecessary. The rule
// below reads the unconstrained `V` as `unknown`; the union names the three shapes a commit takes.
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
function commit(value: V | T[] | undefined): void {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  emit("update:modelValue", value as VcSelectEmittedType<T, V, M>);
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  emit("change", value as VcSelectEmittedType<T, V, M>);
}

function select(item: T) {
  if (!enabled.value) {
    return;
  }

  if (props.multiple) {
    commit(getToggledItems(item));
    return;
  }

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
      const shouldStartAtEnd = key === "end" || key === "up";

      navigate(shouldStartAtEnd ? "end" : "home");
    });
    return;
  }

  navigate(key);
}

// A slotted trigger is a button, whatever `autocomplete` says. A function: slots are not reactive, and a
// slot added or removed after mount swaps the trigger.
function isTypable(): boolean {
  return !!props.autocomplete && !(slots.selected || slots.placeholder);
}

// Enter is consumed only when it opens a select-only list or accepts an option; otherwise a form owns it.
function onConfirm(event: KeyboardEvent, toggle: () => void, close: () => void) {
  if (!isShown.value) {
    if (isTypable() || !enabled.value) {
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
  pick(item, close);
}

function pick(item: T, close: () => void): void {
  select(item);

  if (!props.multiple) {
    close();
  }
}

function toggled(value: boolean) {
  isShown.value = value;

  if (isShown.value) {
    highlight(openedByKeyboard ? filteredItems.value.findIndex((item) => isActiveItem(item)) : -1);

    openedByKeyboard = false;
    replacedRange = undefined;
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
  filterValue.value = insertedText(selectedText.value ?? "", value, replacedRange);
}

function onBeforeSearchInput(event: Event): void {
  const { target } = event;

  replacedRange =
    target instanceof HTMLInputElement && target.selectionStart !== null && target.selectionEnd !== null
      ? [target.selectionStart, target.selectionEnd]
      : undefined;
}

function clear() {
  // Before the commit: the clear button may unmount with what it cleared, dropping focus to <body>.
  focusTrigger();

  // In autocomplete mode - clear search first, then selection
  if (props.autocomplete && filterValue.value) {
    filterValue.value = "";
    return;
  }

  // Clear selection
  if (props.multiple && selectedItems.value.length) {
    commit([]);
  } else if (!props.multiple && hasSelection.value) {
    commit(undefined);
  }
}

function focusTrigger() {
  triggerElement.value?.focus();
}

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
  }

  if (value) {
    void emitSearchDebounced(value);
  } else {
    sendSearch("");
  }
});

if (import.meta.env.DEV) {
  useSelectDevWarnings(props, slots);
}

const isSelectAllShown = computed(() => props.withSelectAll && props.multiple);

// No next page of a query still being typed. The pager shows the spinner while it pages; otherwise
// the loading row does, so exactly one shows.
const hasPageToLoad = computed(() => props.hasNextPage && !isQueryPending.value);

const isLoadingRowShown = computed(() => props.loading && !hasPageToLoad.value);

const isPagerSpinnerShown = computed(() => props.loading && hasPageToLoad.value);

const {
  totalCount,
  selectedCount: countedSelected,
  isAllSelected,
  isSomeSelected,
  isDisabled: isSelectAllDisabled,
  toggle: toggleAll,
} = useSelectAll<T>({
  rows: () => filteredItems.value.map((item, index) => ({ item, active: activeRows.value[index] })),
  selectedItems,
  isSameItem,
  filterValue,
  answeredQuery: echoedQuery,
  serverFilter: () => props.serverFilter,
  answerPending: isAnswerPending,
  total: () => props.total,
  selectedCount: () => props.selectedCount,
});

const selectedOfTotal = computed(() =>
  t("ui_kit.select.selected_of_total", { selected: countedSelected.value, total: totalCount.value }),
);

const selectAllLabel = computed(() =>
  t("ui_kit.select.select_all_label", { selected: countedSelected.value, total: totalCount.value }),
);

const selectAllElement = useTemplateRef<{ focus: () => boolean; $el: HTMLElement }>("selectAllElement");

// A disabled control drops focus to <body>; the trigger keeps it inside the select instead.
watch(isSelectAllDisabled, (disabled) => {
  const active = document.activeElement;

  if (disabled && active && selectAllElement.value?.$el.contains(active)) {
    focusTrigger();
  }
});

function onSelectAll() {
  if (isSelectAllDisabled.value) {
    return;
  }

  const { items, action } = toggleAll();

  commit(items);
  emit("selectAll", { action, query: filterValue.value });
}

// Back to the trigger it came from; forward past the select. A teleported list sits outside the select,
// where the browser's own Tab would leave from.
function onSelectAllTab(event: KeyboardEvent): void {
  if (event.shiftKey) {
    event.preventDefault();
    focusTrigger();
    return;
  }

  const root = document.getElementById(componentId);

  if (!root || root.contains(event.target as Node)) {
    return;
  }

  const candidates = [...document.querySelectorAll<HTMLElement>(FOCUSABLE_CONTENT_SELECTOR)].filter(
    (element) =>
      !hasNegativeTabindex(element) &&
      !element.closest("[inert]") &&
      !owns(element) &&
      !!(root.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING),
  );

  // The first one that takes focus: a hidden match does not.
  for (const element of candidates) {
    element.focus();

    if (document.activeElement === element) {
      event.preventDefault();
      return;
    }
  }
}

function onTab(event: KeyboardEvent) {
  if (!isSelectAllShown.value || !isShown.value || event.shiftKey) {
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
    // VcDropdownMenu's tokens style it too, as themes and forks set them for every dropdown list.
    --dropdown-max-height: var(--vc-select-dropdown-max-height, var(--vc-dropdown-menu-max-height, 12rem));
    --dropdown-radius: var(--vc-select-dropdown-radius, var(--vc-dropdown-menu-radius, var(--vc-radius, 0.5rem)));
    --dropdown-bg-color: var(
      --vc-select-dropdown-bg-color,
      var(--vc-dropdown-menu-bg-color, var(--color-additional-50))
    );

    @apply flex flex-col overflow-hidden rounded-[--dropdown-radius] bg-[--dropdown-bg-color] shadow-lg select-none;
  }

  &__scroll {
    $scroll: &;

    @apply max-h-[--dropdown-max-height] w-full;
  }

  // The dropdown clips its corners, so corner options take its radius or their ring is cut; this holds at
  // rest, not once the list scrolls.
  &__list {
    $paging: "";

    // The options take the dropdown's surface, so its token tints them too.
    --vc-menu-item-bg-color: var(--dropdown-bg-color);

    @apply w-full;

    // The pager's spinner shows below the list; the pager itself stays mounted without it.
    &--paging {
      $paging: &;
    }

    #{$scroll}:first-child & > :first-child {
      --vc-menu-item-radius: var(--dropdown-radius) var(--dropdown-radius) 0 0;
    }

    &:not(#{$paging}) > :last-child {
      --vc-menu-item-radius: 0 0 var(--dropdown-radius) var(--dropdown-radius);
    }

    #{$scroll}:first-child &:not(#{$paging}) > :only-child {
      --vc-menu-item-radius: var(--dropdown-radius);
    }

    // The options' divider continues onto the spinner below, in their colour.
    &:where(#{$paging}) {
      @apply border-b;

      border-color: var(--vc-menu-item-divider-color, var(--color-neutral-100));
    }
  }

  &__loading {
    @apply flex w-full justify-center;
  }
}
</style>
