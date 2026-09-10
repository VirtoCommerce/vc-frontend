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
        <VcSelectTrigger
          ref="triggerElement"
          :selected-item="selected"
          :has-selection="selected !== undefined"
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
          @update:search="search = $event"
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
        <VcListbox :list-id="listboxId" :list-label="accessibleLabel" :multiselectable="multiple">
          <template v-if="showSelectAll" #header>
            <div class="vc-select__select-all">
              <VcCheckbox
                ref="selectAllElement"
                size="sm"
                :model-value="isAllSelected"
                :indeterminate="isSomeSelected"
                :aria-label="selectAllLabel"
                @change="onSelectAll"
                @keydown.esc="focusTrigger()"
                @keydown.down.prevent="focusTrigger()"
              />

              <span class="vc-select__select-all-text">{{ $t("ui_kit.select.select_all") }}</span>

              <span class="vc-select__select-all-count">{{ selectedOfTotal }}</span>
            </div>
          </template>

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

          <VcMenuItem v-if="!filteredItems.length" role="option" :aria-selected="false" disabled :size="itemSize">
            {{ $t(filterValue ? "ui_kit.messages.no_results" : "ui_kit.select.no_options") }}
          </VcMenuItem>
        </VcListbox>
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
import { useElementBounding } from "@vueuse/core";
import { isEqual } from "lodash-es";
import { computed, nextTick, ref, useTemplateRef, provide, toRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { vcPopoverKey } from "@/ui-kit/components/molecules/popover/vc-popover-context";
import { useComponentId, useSelect } from "@/ui-kit/composables";
import VcListbox from "../listbox/vc-listbox.vue";
import VcSelectTrigger from "./vc-select-trigger.vue";

const emit = defineEmits<{
  (event: "update:modelValue", value: VcSelectEmittedType<V, M>): void;
  (event: "change", value: VcSelectEmittedType<V, M>): void;
  /** Select all was pressed. Fires alongside the model update, so a paged consumer can load the rest. */
  (event: "selectAll"): void;
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
const highlightedIndex = ref(-1);

function getOptionId(index: number) {
  return `${componentId}-option-${index}`;
}

const activeDescendantId = computed(() => {
  if (isShown.value && highlightedIndex.value >= 0) {
    return getOptionId(highlightedIndex.value);
  }
  return undefined;
});

const liveRegionMessage = ref("");

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
  textField: toRef(() => props.textField),
  valueField: toRef(() => props.valueField),
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

watch(filteredItems, (items) => {
  highlightedIndex.value = -1;

  if (isShown.value && filterValue.value) {
    liveRegionMessage.value = items.length
      ? t("ui_kit.select.results_available", [items.length])
      : t("ui_kit.select.no_results_found");
  } else {
    liveRegionMessage.value = "";
  }
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

/**
 * Keyboard model: DOM focus never leaves the trigger, and the active option is published
 * through `aria-activedescendant`. The previous code moved real focus onto the option, which
 * made typing impossible in autocomplete mode and tied navigation to DOM order.
 */
function moveHighlight(delta: number) {
  const count = filteredItems.value.length;

  if (!count) {
    return;
  }

  const current = highlightedIndex.value;

  if (current < 0) {
    highlightedIndex.value = delta > 0 ? 0 : count - 1;
    return;
  }

  highlightedIndex.value = (current + delta + count) % count;
}

function onNavigate(key: "up" | "down" | "home" | "end", open: () => void) {
  if (!isShown.value) {
    open();

    // The list may not be rendered yet on the very first open (lazy popover).
    void nextTick(() => {
      highlightedIndex.value = key === "end" ? filteredItems.value.length - 1 : 0;
    });
    return;
  }

  if (key === "home") {
    highlightedIndex.value = 0;
  } else if (key === "end") {
    highlightedIndex.value = filteredItems.value.length - 1;
  } else {
    moveHighlight(key === "down" ? 1 : -1);
  }
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

/**
 * Keep the highlighted option in view without moving focus to it.
 * Deliberately not `scrollIntoView`: that scrolls every scrollable ancestor, so opening a
 * dropdown low on the page yanked the whole page. This adjusts only the list's own scrollTop.
 */
function scrollHighlightedIntoView(index: number) {
  const option = document.getElementById(getOptionId(index));
  const list = option?.closest<HTMLElement>('[role="listbox"]');

  if (!option || !list) {
    return;
  }

  const optionBox = option.getBoundingClientRect();
  const listBox = list.getBoundingClientRect();

  if (optionBox.top < listBox.top) {
    list.scrollTop -= listBox.top - optionBox.top;
  } else if (optionBox.bottom > listBox.bottom) {
    list.scrollTop += optionBox.bottom - listBox.bottom;
  }
}

watch(highlightedIndex, (index) => {
  if (index < 0) {
    return;
  }

  void nextTick(() => scrollHighlightedIntoView(index));
});

function toggled(value: boolean) {
  isShown.value = value;

  if (isShown.value) {
    // Open with the current selection highlighted, so the first arrow press moves from there.
    highlightedIndex.value = filteredItems.value.findIndex((item) => isActiveItem(item));
    return;
  }

  filterValue.value = "";
  highlightedIndex.value = -1;
  focusTrigger();
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

// -----------------------------------------------------------------------------
// Select all
// -----------------------------------------------------------------------------

if (import.meta.env.DEV && props.selectAll && !props.multiple) {
  // eslint-disable-next-line no-console
  console.warn("VcSelect: `select-all` only applies to `multiple` selects and is ignored here.");
}

const showSelectAll = computed(() => props.selectAll && props.multiple);

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

const totalCount = computed(() => props.total ?? filteredItems.value.length);

const selectedOfTotal = computed(() =>
  t("ui_kit.select.selected_of_total", { selected: selectedValues.value.length, total: totalCount.value }),
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
  $disabled: "";
  $readonly: "";
  $opened: "";
  $error: "";

  --radius: var(--vc-select-radius, var(--vc-radius, 0.5rem));

  @apply flex flex-col;

  &--disabled {
    $disabled: &;
  }

  &--readonly {
    $readonly: &;
  }

  &--opened {
    $opened: &;
  }

  &--error {
    $error: &;
  }

  &__container {
    @apply relative rounded-[--radius];
  }

  &__button {
    @apply relative flex items-center w-full rounded-[--radius] border bg-additional-50 appearance-none text-left;

    #{$disabled} &,
    &:disabled {
      @apply bg-neutral cursor-not-allowed pointer-events-none;
    }

    #{$readonly} & {
      @apply pointer-events-none;
    }

    #{$error} & {
      @apply border-danger;
    }

    &:focus {
      @apply outline-none ring-[3px] ring-primary-100;
    }
  }

  &__button {
    // Same scale as VcInput so both triggers line up at a given size.
    // `auto` keeps its height from the content, as before.
    &--size {
      &--xs {
        @apply h-8 text-sm;
      }

      &--sm {
        @apply h-[2.375rem] text-base;
      }

      &--md {
        @apply h-11 text-base;
      }
    }
  }

  &__select-all {
    @apply flex items-center gap-3 px-3 py-2.5;

    &-text {
      @apply grow text-sm font-bold text-neutral-950;
    }

    &-count {
      @apply shrink-0 text-sm text-neutral-600;
    }
  }

  &__button-content {
    @apply grow overflow-y-hidden flex flex-col justify-center min-w-0 h-full;

    #{$error} & {
      @apply text-danger;
    }
  }

  &__input {
    @apply w-full cursor-pointer;

    & input {
      @apply cursor-pointer;

      #{$opened} & {
        @apply cursor-auto;
      }
    }
  }

  &__arrow {
    #{$readonly} & {
      @apply hidden;
    }
  }

  &__icon {
    @apply shrink-0 mr-3 text-neutral-900;

    #{$disabled} & {
      @apply text-neutral-400;
    }

    #{$readonly} & {
      @apply hidden;
    }
  }
}
</style>
