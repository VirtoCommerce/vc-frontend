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
      shadow
      @toggle="toggled"
    >
      <template #trigger="{ open, toggle, close }">
        <!-- `!= null`: an unset GraphQL value arrives as null, and without `valueField` the model is the item. -->
        <VcSelectTrigger
          ref="triggerElement"
          :selected-item="selected"
          :has-selection="selected != null"
          :search="search"
          :placeholder-text="placeholderText ?? undefined"
          :size="size"
          :opened="isShown"
          :clear-visible="isClearButtonVisible"
          :autocomplete="autocomplete"
          :disabled="disabled"
          :readonly="readonly"
          :error="error"
          :required="required"
          :accessible-label="accessibleLabel"
          :trigger-id="triggerId"
          :listbox-id="listboxId"
          :details-id="detailsId"
          :active-descendant-id="activeDescendantId"
          @toggle="toggle"
          @open="open"
          @clear="clear"
          @navigate="onNavigate($event, open)"
          @confirm="onConfirm($event, toggle, close)"
          @tab="onTab"
          @update:search="onSearchInput($event, open)"
        >
          <template v-if="$slots.selected" #selected="scope">
            <slot name="selected" v-bind="scope" />
          </template>

          <template v-if="$slots.placeholder" #placeholder="scope">
            <slot name="placeholder" v-bind="scope" />
          </template>
        </VcSelectTrigger>
      </template>

      <template v-if="enabled" #content="{ close }">
        <div class="vc-select__dropdown">
          <div v-if="showSelectAll" class="vc-select__select-all">
            <VcCheckbox
              ref="selectAllElement"
              size="sm"
              class="vc-select__select-all-control"
              :model-value="isAllSelected"
              :indeterminate="isSomeSelected"
              :aria-label="selectAllLabel"
              prevent-default
              @change="onSelectAll"
              @keydown.esc.stop="close()"
              @keydown.down.prevent="focusTrigger()"
            >
              <span class="vc-select__select-all-text">{{ $t("ui_kit.select.select_all") }}</span>
            </VcCheckbox>

            <span class="vc-select__select-all-count">{{ selectedOfTotal }}</span>
          </div>

          <VcScrollbar class="vc-select__scroll" vertical>
            <!-- Only options may live in a listbox, so the pager sits beside the list, not in it. -->
            <ul
              :id="listboxId"
              ref="listElement"
              class="vc-select__list"
              role="listbox"
              :aria-label="accessibleLabel"
              :aria-multiselectable="multiple || undefined"
            >
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
                @mousedown.prevent
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

              <VcMenuItem v-if="showLoadingRow" role="option" :aria-selected="false" disabled :size="itemSize">
                <span class="vc-select__loading">
                  <slot name="loading">
                    <VcLoader />

                    <span class="sr-only">{{ $t("ui_kit.messages.loading_text") }}</span>
                  </slot>
                </span>
              </VcMenuItem>

              <VcMenuItem
                v-else-if="!filteredItems.length && !loading"
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
              :has-next-page="hasNextPage"
              @load-more="$emit('loadMore')"
            />
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
import { computed, nextTick, ref, useTemplateRef, provide, toRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { vcPopoverKey } from "@/ui-kit/components/molecules/popover/vc-popover-context";
import { useComponentId, useListboxNavigation, useSelect } from "@/ui-kit/composables";
import { insertedText } from "@/ui-kit/utilities/text-diff";
import VcSelectTrigger from "./vc-select-trigger.vue";
import type { ListboxNavigationKeyType } from "@/ui-kit/composables";

const emit = defineEmits<{
  (event: "update:modelValue", value: VcSelectEmittedType<V, M>): void;
  (event: "change", value: VcSelectEmittedType<V, M>): void;
  /**
   * Select all was pressed: `selected` is true when it selected, false when it cleared. Fires
   * alongside the model update, so a paged consumer can select or clear the options not loaded.
   */
  (event: "selectAll", selected: boolean): void;
  /** The list is resting at its end and more pages are available. */
  (event: "loadMore"): void;
  /** Debounced search text; only emitted when `serverFilter` is set. */
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
    valueField?: VcSelectFieldAccessorType<T, V>;
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
    /** Turns off client-side filtering — the consumer filters and re-supplies `items`. */
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

const liveRegionMessage = computed(() => {
  if (!isShown.value || !filterValue.value) {
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
// value needs a cast that the lint rule, judging the resolved type, calls unnecessary.
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

  const item = isPassiveHighlight.value ? undefined : filteredItems.value[highlightedIndex.value];

  if (item === undefined) {
    return;
  }

  event.preventDefault();
  select(item);

  if (!props.multiple) {
    close();
  }
}

// Opened from the keyboard, the selection is a keyboard position and rings; from the pointer it is passive.
let openedByKeyboard = false;

function toggled(value: boolean) {
  isShown.value = value;

  if (isShown.value) {
    const selectedIndex = filteredItems.value.findIndex((item) => isActiveItem(item));

    if (openedByKeyboard) {
      highlight(selectedIndex);
    } else {
      highlightPassively(selectedIndex);
    }

    openedByKeyboard = false;
    return;
  }

  filterValue.value = "";
  resetHighlight();

  if (holdsFocus()) {
    focusTrigger();
  }
}

// Focus returns to the trigger only if it is still ours (or nowhere): an outside click has already
// put it where the user aimed.
function holdsFocus(): boolean {
  const active = document.activeElement;

  if (!active || active === document.body) {
    return true;
  }

  // A teleported dropdown is not inside the root; the listbox id reaches it.
  const dropdown = document.getElementById(listboxId)?.closest(".vc-select__dropdown");

  return document.getElementById(componentId)?.contains(active) === true || dropdown?.contains(active) === true;
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
    emit("search", value);
  }
}, SEARCH_DEBOUNCE_MS);

watch(filterValue, (value) => {
  if (!props.serverFilter) {
    return;
  }

  // The options under the highlight stay the previous query's until the consumer answers.
  resetHighlight();

  if (value) {
    void emitSearchDebounced(value);
  } else {
    emit("search", "");
  }
});

// -----------------------------------------------------------------------------
// Select all
// -----------------------------------------------------------------------------

if (import.meta.env.DEV && props.selectAll && !props.multiple) {
  // eslint-disable-next-line no-console
  console.warn("VcSelect: `select-all` only applies to `multiple` selects and is ignored here.");
}

const showSelectAll = computed(() => props.selectAll && props.multiple);

// VcLoadMore draws its own spinner once another page is known to exist.
const showLoadingRow = computed(() => props.loading && !filteredItems.value.length && !props.hasNextPage);

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

// Checked means `n of n`: a fully selected page of a longer list is still partial.
const isAllSelected = computed(
  () =>
    selectableValues.value.length > 0 &&
    selectedVisibleCount.value === selectableValues.value.length &&
    countedSelected.value >= totalCount.value,
);

const isSomeSelected = computed(() => countedSelected.value > 0 && !isAllSelected.value);

const selectedOfTotal = computed(() =>
  t("ui_kit.select.selected_of_total", { selected: countedSelected.value, total: totalCount.value }),
);

const selectAllLabel = computed(() =>
  t("ui_kit.select.select_all_label", { selected: countedSelected.value, total: totalCount.value }),
);

function onSelectAll() {
  const clearing = isAllSelected.value;

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

  emit("selectAll", !clearing);
}

const selectAllElement = useTemplateRef<{ $el: HTMLElement }>("selectAllElement");

function onTab(event: KeyboardEvent) {
  if (!showSelectAll.value || !isShown.value || event.shiftKey) {
    return;
  }

  if (focusSelectAll()) {
    event.preventDefault();
  }
}

// The checkbox is outside the listbox and possibly teleported, so Tab hands focus over explicitly.
function focusSelectAll(): boolean {
  const input = selectAllElement.value?.$el?.querySelector<HTMLElement>("input");

  if (!input) {
    return false;
  }

  input.focus();
  return true;
}
</script>

<style lang="scss">
.vc-select {
  --radius: var(--vc-select-radius, var(--vc-radius, 0.5rem));

  @apply flex flex-col;

  &__container {
    @apply relative rounded-[--radius];
  }

  // May be teleported, so it declares its own tokens; `--vc-dropdown-menu-*` stay as fallbacks.
  &__dropdown {
    --dropdown-max-height: var(--vc-select-dropdown-max-height, var(--vc-dropdown-menu-max-height, 12rem));
    --dropdown-radius: var(--vc-select-dropdown-radius, var(--vc-dropdown-menu-radius, var(--vc-radius, 0.5rem)));
    --dropdown-bg-color: var(
      --vc-select-dropdown-bg-color,
      var(--vc-dropdown-menu-bg-color, var(--color-additional-50))
    );

    @apply flex flex-col overflow-hidden rounded-[--dropdown-radius] bg-[--dropdown-bg-color] select-none;
  }

  &__scroll {
    @apply max-h-[--dropdown-max-height] w-full;
  }

  &__list {
    @apply w-full divide-y divide-neutral-100;
  }

  &__more {
    @apply border-t border-neutral-100;
  }

  &__loading {
    @apply flex w-full justify-center;
  }

  &__select-all {
    @apply flex shrink-0 items-center gap-3 border-b border-neutral-100 px-3 py-2.5;

    &-control {
      @apply grow;
    }

    &-text {
      @apply text-sm font-bold text-neutral-950;
    }

    &-count {
      @apply shrink-0 text-sm text-neutral-600;
    }
  }
}
</style>
