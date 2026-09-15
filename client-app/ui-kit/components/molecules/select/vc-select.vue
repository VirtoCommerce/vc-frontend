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
        <!--
          has-selection is `!= null`, not `!== undefined`: an unset GraphQL value arrives as null,
          and without `valueField` the raw model IS the item, so a null model reached the #selected
          slot as a selection that is not there.
        -->
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
          @close="close()"
          @clear="clear"
          @navigate="onNavigate($event, open)"
          @confirm="onConfirm(toggle, close)"
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
            <!-- The text goes in the checkbox's own slot: as a sibling span it labelled nothing,
                   so clicking the word "Select all" did not toggle the control. -->
            <VcCheckbox
              ref="selectAllElement"
              size="sm"
              class="vc-select__select-all-control"
              :model-value="isAllSelected"
              :indeterminate="isSomeSelected"
              :aria-label="selectAllLabel"
              @change="onSelectAll"
              @keydown.esc="focusTrigger()"
              @keydown.down.prevent="focusTrigger()"
            >
              <span class="vc-select__select-all-text">{{ $t("ui_kit.select.select_all") }}</span>
            </VcCheckbox>

            <span class="vc-select__select-all-count">{{ selectedOfTotal }}</span>
          </div>

          <VcScrollbar
            :id="listboxId"
            vertical
            tag="ul"
            role="listbox"
            :aria-label="accessibleLabel"
            :aria-multiselectable="multiple || undefined"
            class="vc-select__list"
          >
            <VcMenuItem
              v-for="(item, index) in filteredItems"
              :key="index"
              :option-id="getOptionId(index)"
              :data-vc-select-option="componentId"
              :active="isActiveItem(item)"
              :highlighted="index === highlightedIndex"
              :aria-selected="isActiveItem(item)"
              role="option"
              :size="itemSize"
              :tabindex="-1"
              @click="
                select(item);
                !multiple && close();
              "
              @mousemove="highlightedIndex = index"
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
              <!-- The row is a flex line that starts at the left like any option; a spinner standing
                 in for the whole list belongs in the middle of it. -->
              <span class="vc-select__loading">
                <slot name="loading">
                  <VcLoader />
                </slot>
              </span>
            </VcMenuItem>

            <VcMenuItem
              v-else-if="!filteredItems.length"
              role="option"
              :aria-selected="false"
              disabled
              :size="itemSize"
            >
              <slot name="empty">
                {{ $t(filterValue ? "ui_kit.messages.no_results" : "ui_kit.select.no_options") }}
              </slot>
            </VcMenuItem>

            <VcLoadMore
              tag="li"
              role="none"
              :loading="loading"
              :has-next-page="hasNextPage"
              @load-more="$emit('loadMore')"
            >
              <template #loading>
                <slot name="loading">
                  <VcLoader />
                </slot>
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
  /** Select all was pressed. Fires alongside the model update, so a paged consumer can load the rest. */
  (event: "selectAll"): void;
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
    /**
     * The `& boolean` is load-bearing, not decoration: with a bare `M` the compiler emits no
     * Boolean prop cast, so a valueless `multiple` attribute arrives as "" and multi-select
     * silently degrades to single. The rule below judges the intersection as useless because
     * `M` is already constrained to boolean — it cannot see the runtime cast that depends on it.
     */
    // eslint-disable-next-line sonarjs/no-useless-intersection
    multiple?: M & boolean;
    clearable?: boolean;
    /** Adds a Select all row above the options. Multiple mode only. */
    selectAll?: boolean;
    /**
     * Size of the whole set for the counter. Defaults to the number of options currently
     * rendered; pass it explicitly when the list is paged and `items` holds only one page.
     */
    total?: number;
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

// VcDropdownMenu used to do this; the dropdown matches the trigger's width.
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

const { highlightedIndex, getOptionId, navigate } = useListboxNavigation({
  componentId,
  items: filteredItems,
  getKey: getItemValue,
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

/**
 * Single funnel for both events; each caller passes the shape correct for its own mode.
 * `M` is still an unresolved type parameter here, so `VcSelectEmittedType<V, M>` stays a
 * deferred conditional type and nothing can be assigned to it without a cast — the lint
 * rule judges the cast by the resolved type, the compiler by the deferred one.
 */
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

  // Single mode stays idempotent: re-picking the current value emits nothing.
  // Reuses isActiveItem so the check matches the deep comparison that drives the
  // highlight — a strict `===` here would re-emit for a deep-equal object model.
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
      // APG: Down/Home open on the first option, Up/End on the last. Opening upwards onto the
      // first option would send the very next ArrowUp wrapping to the bottom.
      const toLast = key === "end" || key === "up";

      highlightedIndex.value = toLast ? filteredItems.value.length - 1 : 0;
    });
    return;
  }

  navigate(key);
}

function onConfirm(toggle: () => void, close: () => void) {
  if (!isShown.value) {
    toggle();
    return;
  }

  const item = filteredItems.value[highlightedIndex.value];

  if (item === undefined) {
    return;
  }

  select(item);

  if (!props.multiple) {
    close();
  }
}

function toggled(value: boolean) {
  isShown.value = value;

  if (isShown.value) {
    // Open with the current selection highlighted, so the first arrow press moves from there.
    highlightedIndex.value = filteredItems.value.findIndex((item) => isActiveItem(item));
    return;
  }

  filterValue.value = "";
  highlightedIndex.value = -1;

  // A closed dropdown owes the keyboard user its focus back — but only while the focus is still
  // ours to give back. An outside click has already put it where the user asked for it, and
  // taking it from there is what makes the next field impossible to click into.
  if (holdsFocus()) {
    focusTrigger();
  }
}

/**
 * May the trigger take the focus back? Only when nobody else is holding it: an outside click has
 * already delivered it to whatever the user aimed at, and pulling it away from there is what makes
 * the next field impossible to click into.
 *
 * A bare `<body>` counts as ours. Clicking past the dropdown onto nothing focusable leaves focus
 * nowhere, and so does picking an option in a browser that does not focus what it clicks — the
 * keyboard user has to get the trigger back in both.
 */
function holdsFocus(): boolean {
  const active = document.activeElement;

  if (!active || active === document.body) {
    return true;
  }

  // The dropdown is teleported, so it is not a descendant of the root; reach it through the
  // listbox id, the one element the two sides share.
  const dropdown = document.getElementById(listboxId)?.closest(".vc-select__dropdown");

  return document.getElementById(componentId)?.contains(active) === true || dropdown?.contains(active) === true;
}

/**
 * Typing is what opens an autocomplete list — the APG editable combobox opens on input, not on
 * focus. While closed the field shows the current selection, so the keystroke landed inside that
 * label; typing starts a fresh query instead of editing the selected text.
 */
function onSearchInput(value: string, open: () => void): void {
  if (!props.autocomplete || isShown.value) {
    filterValue.value = value;
    return;
  }

  // Open before assigning: the live-region watcher on the filtered list only announces while the
  // list is on screen, and it runs once for both changes.
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

// Server-side search: the consumer owns filtering, so the typed text is forwarded instead of
// being applied locally. Clearing is sent immediately — waiting to restore a full list feels broken.
const SEARCH_DEBOUNCE_MS = 300;
const emitSearchDebounced = useDebounceFn((value: string) => emit("search", value), SEARCH_DEBOUNCE_MS);

watch(filterValue, (value) => {
  if (!props.serverFilter) {
    return;
  }

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

// A spinner replaces the empty row only while there is nothing to show yet, and only while
// nothing else is already reporting the fetch: VcLoadMore draws its own as soon as it knows
// another page is coming, and two spinners in a row of three is what the overlap used to look like.
const showLoadingRow = computed(() => props.loading && !filteredItems.value.length && !props.hasNextPage);

/** Select all acts on what the user can see, so an active filter narrows it. */
const selectableValues = computed(() => filteredItems.value.map((item) => getItemValue(item)));

const selectedVisibleCount = computed(
  () =>
    selectableValues.value.filter((value) => selectedValues.value.some((current) => isEqual(current, value))).length,
);

const isAllSelected = computed(
  () => selectableValues.value.length > 0 && selectedVisibleCount.value === selectableValues.value.length,
);

const isSomeSelected = computed(() => selectedVisibleCount.value > 0 && !isAllSelected.value);

/**
 * The counter must describe the same set the checkbox beside it reports on, and Select all acts
 * on what the user can see. While a local filter is narrowing the list, `total` cannot know about
 * it — left alone it reads `1 of 1` next to an unchecked box, the one selected item being the one
 * the filter hid. A server-side filter is exempt: there the consumer re-supplies both the items
 * and the matching `total`.
 */
const localFilter = computed(() => !!filterValue.value && !props.serverFilter);

const totalCount = computed(() =>
  localFilter.value ? filteredItems.value.length : (props.total ?? filteredItems.value.length),
);

const selectedCount = computed(() => (localFilter.value ? selectedVisibleCount.value : selectedValues.value.length));

const selectedOfTotal = computed(() =>
  t("ui_kit.select.selected_of_total", { selected: selectedCount.value, total: totalCount.value }),
);

const selectAllLabel = computed(
  () =>
    `${t(isAllSelected.value ? "ui_kit.select.deselect_all" : "ui_kit.select.select_all")}, ${selectedOfTotal.value}`,
);

function onSelectAll() {
  if (isAllSelected.value) {
    // Clear only what is visible; anything filtered out keeps its selection.
    const visible = selectableValues.value;
    commit(selectedValues.value.filter((value) => !visible.some((item) => isEqual(item, value))));
  } else {
    const merged = [...selectedValues.value];

    selectableValues.value.forEach((value) => {
      if (!merged.some((current) => isEqual(current, value))) {
        merged.push(value);
      }
    });

    commit(merged);
  }

  // Always announced: the component can only reach loaded options, so a paged consumer
  // needs the event to decide whether to fetch and select the rest.
  emit("selectAll");
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

/**
 * The Select all checkbox sits outside the listbox, so `aria-activedescendant` cannot reach
 * it, and the popover is teleported, so native Tab order does not either. Tab from the
 * trigger hands focus over explicitly.
 */
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

  // The dropdown is teleported out of the block, so it inherits nothing from it and declares its
  // own tokens. The `--vc-dropdown-menu-*` fallbacks keep overrides working for anyone who styled
  // this dropdown before it moved off VcDropdownMenu.
  &__dropdown {
    --dropdown-max-height: var(--vc-select-dropdown-max-height, var(--vc-dropdown-menu-max-height, 12rem));
    --dropdown-radius: var(--vc-select-dropdown-radius, var(--vc-dropdown-menu-radius, var(--vc-radius, 0.5rem)));
    --dropdown-bg-color: var(
      --vc-select-dropdown-bg-color,
      var(--vc-dropdown-menu-bg-color, var(--color-additional-50))
    );

    // overflow-hidden lets the container round its own corners, so the first and last option
    // need no radius of their own.
    @apply flex flex-col overflow-hidden rounded-[--dropdown-radius] bg-[--dropdown-bg-color] select-none;
  }

  &__list {
    @apply max-h-[--dropdown-max-height] w-full divide-y divide-neutral-100;
  }

  &__loading {
    @apply flex w-full justify-center;
  }

  // shrink-0 + the rule below it: the row is a flex sibling of the scroll area now, so it has to
  // refuse to shrink and draw the line that separated it from the list.
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
