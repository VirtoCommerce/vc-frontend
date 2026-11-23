<template>
  <div
    ref="containerRef"
    class="vc-variant-picker-group"
    :class="{
      'vc-variant-picker-group--columns': !!columns,
      [`vc-variant-picker-group--columns--${columns}`]: !!columns,
    }"
    :role="multiple ? 'group' : 'radiogroup'"
    :aria-label="ariaLabelValue"
    tabindex="-1"
    :data-test-id="testId"
    @focus="($event.target as HTMLElement).blur()"
    @focusin="updateTabStop($event.target)"
    @focusout="updateTabStop($event.relatedTarget)"
  >
    <slot />

    <div v-if="truncate" v-show="isButtonVisible" ref="buttonWrapperRef" class="vc-variant-picker-group__wrapper">
      <VcButton
        ref="buttonRef"
        class="vc-variant-picker-group__button"
        :size="size"
        square
        color="secondary"
        variant="soft"
        :aria-expanded="ariaExpandedValue"
        :aria-label="buttonAriaLabel"
        @click="expand"
        @keydown="onKeydown"
      >
        +{{ hiddenCount }}
      </VcButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn, useResizeObserver } from "@vueuse/core";
import { isEqual } from "lodash-es";
import { ref, computed, onMounted, onUpdated, nextTick, watch, provide, shallowRef, toRefs } from "vue";
import { useI18n } from "vue-i18n";
import { getRovingFocusTarget } from "@/ui-kit/utilities";
import { Logger } from "@/ui-kit/utilities/logger";

interface IEmits {
  (event: "update:modelValue", value: string | string[]): void;
  (event: "change", value: string | string[]): void;
}

interface IProps {
  modelValue?: string | string[];
  multiple?: boolean;
  size?: VcVariantPickerSizeType;
  type?: VcVariantPickerType;
  name?: string;
  truncate?: boolean;
  maxRows?: number;
  ariaLabel?: string;
  testId?: string;
  /**
   * Lays the pickers out in that many equal columns; text tiles and cards fill their cell, so the cards of a row
   * share its height. Colour and image swatches keep their size. Not set: the pickers wrap (see `fullWidth`).
   */
  columns?: VcVariantPickerGroupColumnsType;
  /**
   * Without `columns`: the text tiles and cards of a row share its width and height, none narrower than its content.
   */
  fullWidth?: boolean;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  multiple: false,
  maxRows: 2,
  fullWidth: false,
});

const NAV_KEYS = new Map<string, "next" | "prev">([
  ["ArrowRight", "next"],
  ["ArrowDown", "next"],
  ["ArrowLeft", "prev"],
  ["ArrowUp", "prev"],
]);
const TRIGGER_SELECTOR = ".vc-variant-picker__trigger";

const LAYOUT_CONFIG = {
  POSITION_TOLERANCE: 2,
  RESIZE_DEBOUNCE_MS: 100,
};

const containerRef = ref<HTMLElement | null>(null);
const buttonWrapperRef = ref<HTMLElement | null>(null);
const buttonRef = ref<VcButtonExposedType | null>(null);
const tabStop = shallowRef<HTMLElement | null>(null);

const expanded = ref(false);
const showButton = ref(false);
const hiddenCount = ref(0);
const visibleItemsCount = ref(0);
const { modelValue, multiple, size, type, name, truncate, maxRows, ariaLabel } = toRefs(props);

const internalModelValue = ref<string | string[]>(modelValue.value ?? (multiple.value ? [] : ""));

const { t } = useI18n();
const debouncedMeasureAndLayout = useDebounceFn(measureAndLayout, LAYOUT_CONFIG.RESIZE_DEBOUNCE_MS);

const ariaLabelValue = computed(() => ariaLabel.value ?? t("ui_kit.accessibility.variant_picker_group"));
const width: VcVariantPickerGroupContextType["width"] = computed(() => {
  if (props.columns) {
    return "stretch";
  }

  return props.fullWidth ? "share" : "content";
});
const buttonAriaLabel = computed(() => t("ui_kit.accessibility.show_more_button", { count: hiddenCount.value }));
const isButtonVisible = computed(() => truncate.value && !expanded.value && showButton.value);
const ariaExpandedValue = computed(() => (expanded.value ? "true" : "false"));

useResizeObserver(containerRef, debouncedMeasureAndLayout);

function getGroupItems(containerEl: HTMLElement | null, onlyVisible = false): HTMLElement[] {
  if (!containerEl?.children) {
    return [];
  }

  try {
    const wrapperEl = buttonWrapperRef.value;
    const directItems = Array.from(containerEl.children).filter(
      (item) => item instanceof HTMLElement && item !== wrapperEl,
    ) as HTMLElement[];

    if (!onlyVisible) {
      return directItems;
    }

    return directItems.filter((el) => el.style.display !== "none");
  } catch (error) {
    Logger.error("VcVariantPickerGroup: Failed to get items", error);
    return [];
  }
}

function analyzeItemsLayout(items: HTMLElement[]) {
  if (!Array.isArray(items) || items.length === 0) {
    return { rowCount: 0 };
  }

  try {
    const positions = items.map((el) => el.offsetTop);
    const rowTops: number[] = [];

    positions.forEach((elementTop) => {
      const hasMatch = rowTops.some((top) => Math.abs(elementTop - top) < LAYOUT_CONFIG.POSITION_TOLERANCE);

      if (!hasMatch) {
        rowTops.push(elementTop);
      }
    });

    return { rowCount: rowTops.length };
  } catch (error) {
    Logger.error("VcVariantPickerGroup: Failed to analyze items layout", error);
    return { rowCount: 0 };
  }
}

function resetItemsVisibility(items: HTMLElement[]) {
  if (!Array.isArray(items)) {
    return;
  }

  items.forEach((item) => {
    if (item.style.display === "none") {
      item.style.display = "";
    }
  });
}

function updateButtonState(totalItems: number, visibleItems: number) {
  const finalHidden = Math.max(0, totalItems - visibleItems);

  if (finalHidden > 0) {
    showButton.value = true;
    hiddenCount.value = finalHidden;
  } else {
    showButton.value = false;
    hiddenCount.value = 0;
  }
}

function shouldPerformLayout(): boolean {
  return truncate.value && !expanded.value;
}

function prepareLayoutItems(): { items: HTMLElement[]; total: number } | null {
  const container = containerRef.value;
  if (container === null) {
    return null;
  }

  const items = getGroupItems(container);
  const total = items.length;

  if (total === 0) {
    showButton.value = false;
    hiddenCount.value = 0;
    return null;
  }

  resetItemsVisibility(items);
  showButton.value = false;

  return { items, total };
}

function checkIfLayoutNeeded(items: HTMLElement[]): boolean {
  const { rowCount } = analyzeItemsLayout(items);

  if (rowCount <= maxRows.value) {
    showButton.value = false;
    hiddenCount.value = 0;
    return false;
  }

  return true;
}

function isButtonPositionValid(items: HTMLElement[], visibleIdxLimit: number, rowCount: number): boolean {
  const buttonEl = buttonWrapperRef.value;

  if (buttonEl === null) {
    return true;
  }

  const lastIdx = visibleIdxLimit - 1;
  const lastItemTop = lastIdx >= 0 ? items[lastIdx].offsetTop : buttonEl.offsetTop;
  const btnTop = buttonEl.offsetTop;

  if (Math.abs(btnTop - lastItemTop) < LAYOUT_CONFIG.POSITION_TOLERANCE) {
    return true;
  }

  // The first picker always stays: when the button cannot share its row (one column, or a picker as wide as the row),
  // the button goes below it. A grid also puts the button in the next cell, which may start a row of its own.
  return visibleIdxLimit === 1 || (!!props.columns && rowCount < maxRows.value);
}

function countRowsWithButton(items: HTMLElement[], visibleCount: number): number {
  const shown = items.slice(0, visibleCount);

  if (buttonWrapperRef.value) {
    shown.push(buttonWrapperRef.value);
  }

  return analyzeItemsLayout(shown).rowCount;
}

async function findOptimalVisibleCount(items: HTMLElement[], total: number): Promise<number> {
  for (let visibleIdxLimit = total; visibleIdxLimit > 0; visibleIdxLimit--) {
    const { rowCount } = analyzeItemsLayout(items.filter((_, idx) => idx < visibleIdxLimit));

    const fits = rowCount <= maxRows.value;
    const btnValid = fits && isButtonPositionValid(items, visibleIdxLimit, rowCount);

    if (btnValid) {
      return visibleIdxLimit;
    }

    items[visibleIdxLimit - 1].style.display = "none";
    await nextTick();
  }

  return 0;
}

async function expand(): Promise<void> {
  expanded.value = true;
  showButton.value = false;

  const el = containerRef.value;
  if (!el) {
    return;
  }

  const items = getGroupItems(el);
  resetItemsVisibility(items);

  const firstNewIndex = visibleItemsCount.value;

  await nextTick();
  await nextTick();
  focusPickerAtIndex(firstNewIndex);
}

async function performLayoutMeasurement(items: HTMLElement[], total: number): Promise<void> {
  const { rowCount: allItemsRowCount } = analyzeItemsLayout(items);

  if (!checkIfLayoutNeeded(items)) {
    return;
  }

  showButton.value = true;
  await nextTick();

  let visibleCount = await findOptimalVisibleCount(items, total);

  // A "+N" that takes as many rows as the pickers it hides saves nothing (a grid cell, a row of its own), so all show.
  if (allItemsRowCount <= countRowsWithButton(items, visibleCount)) {
    resetItemsVisibility(items);
    visibleCount = total;
  }

  visibleItemsCount.value = visibleCount;
  updateButtonState(total, visibleCount);
}

async function measureAndLayout() {
  if (!shouldPerformLayout()) {
    return;
  }

  const layoutData = prepareLayoutItems();
  if (layoutData === null) {
    return;
  }

  const { items, total } = layoutData;

  await nextTick();
  await performLayoutMeasurement(items, total);
  // Hiding pickers re-renders nothing when the +N count comes out as before.
  updateTabStop();
}

function focusPickerAtIndex(index: number): void {
  const container = containerRef.value;
  if (container === null) {
    return;
  }

  const items = getGroupItems(container, true);
  const target = items[index];
  if (!target) {
    return;
  }

  const button = target.querySelector<HTMLElement>(TRIGGER_SELECTOR);
  if (button) {
    button.focus();
  }
}

function findCurrentItemIndex(targetElement: HTMLElement, precomputedItems?: HTMLElement[]): number {
  const container = containerRef.value;
  if (container === null) {
    return -1;
  }

  const items = precomputedItems ?? getGroupItems(container, true);
  return items.findIndex((el) => el.contains(targetElement));
}

interface INavContext {
  container: HTMLElement;
  items: HTMLElement[];
  currentIndex: number;
  button: VcButtonExposedType | null;
}

function getNavContext(from: EventTarget | null): INavContext | null {
  if (!(from instanceof HTMLElement)) {
    return null;
  }

  const container = containerRef.value;
  if (!container || !container.contains(from)) {
    return null;
  }

  const items = getGroupItems(container, true);
  const currentIndex = findCurrentItemIndex(from, items);

  return {
    container,
    items,
    currentIndex,
    button: buttonRef.value,
  };
}

function navigateBy(direction: "next" | "prev", from: EventTarget | null): void {
  const ctx = getNavContext(from);

  if (!ctx) {
    return;
  }

  const { items, currentIndex, button } = ctx;

  const isFromButton = from instanceof Node && buttonWrapperRef.value?.contains(from);
  if (isFromButton) {
    if (direction === "prev" && items.length > 0) {
      focusPickerAtIndex(items.length - 1);
    }

    return;
  }

  if (currentIndex < 0) {
    return;
  }

  const delta = direction === "next" ? 1 : -1;
  const nextIndex = currentIndex + delta;

  if (nextIndex >= 0 && nextIndex < items.length) {
    focusPickerAtIndex(nextIndex);
    return;
  }

  if (direction === "next" && isButtonVisible.value && button) {
    button.focus();
  }
}

function onTabKey(event: KeyboardEvent): void {
  const ctx = getNavContext(event.target);

  if (ctx === null) {
    return;
  }

  const isShift = event.shiftKey;
  const from = event.target;
  const isFromButton = from instanceof Node && buttonWrapperRef.value?.contains(from);

  const { items, currentIndex } = ctx;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === items.length - 1 && !isButtonVisible.value;

  if ((isShift && isFirst) || (!isShift && (isFromButton || isLast))) {
    return;
  }

  event.preventDefault();
  navigateBy(isShift ? "prev" : "next", event.target);
}

// A picker inside a wrapper element counts too: it reads the group's tab stop like a direct child.
function getTriggers(): HTMLElement[] {
  return getGroupItems(containerRef.value, true).flatMap((item) =>
    Array.from(item.querySelectorAll<HTMLElement>(TRIGGER_SELECTOR)),
  );
}

// A single-choice group's one Tab stop (roving tabindex): the focused trigger while the focus is on one, else the
// checked one, else the first one; truncated pickers do not count. The next Tab goes to the +N button, then out.
function updateTabStop(focused: EventTarget | null = document.activeElement): void {
  const triggers = getTriggers();

  tabStop.value =
    triggers.find((trigger) => trigger === focused) ??
    triggers.find((trigger) => trigger.getAttribute("aria-checked") === "true") ??
    triggers[0] ??
    null;
}

// Bound on the pickers' triggers (through the context) and on the +N button, the elements that take focus. A
// `multiple` group keeps the base keys: every checkbox is a Tab stop, and Tab and the arrows step through the pickers
// to the +N button. In a single-choice group an arrow only moves the focus: selecting on the move would drop, on the
// product page, a choice of another property that the passed option does not come with.
function onKeydown(event: KeyboardEvent): void {
  if (multiple.value) {
    onCheckboxKeydown(event);
    return;
  }

  const target = containerRef.value && getRovingFocusTarget(event, getTriggers(), containerRef.value);

  if (target) {
    event.preventDefault();
    target.focus();
  }
}

function onCheckboxKeydown(event: KeyboardEvent): void {
  if (event.key === "Tab") {
    onTabKey(event);
    return;
  }

  const direction = NAV_KEYS.get(event.key);

  if (direction) {
    event.preventDefault();
    navigateBy(direction, event.target);
  }
}

function toggleValue(value: string | string[]): void {
  const valueToSet = Array.isArray(value) ? [...value] : value;

  if (multiple.value) {
    let currentValue: (string | string[])[] = [];

    if (Array.isArray(internalModelValue.value)) {
      currentValue = [...internalModelValue.value] as (string | string[])[];
    } else if (internalModelValue.value) {
      currentValue = [internalModelValue.value];
    }

    const index = currentValue.findIndex((v) => isEqual(v, valueToSet));

    if (index > -1) {
      currentValue.splice(index, 1);
      internalModelValue.value = currentValue as string | string[];
    } else {
      internalModelValue.value = [...currentValue, valueToSet] as string | string[];
    }
  } else {
    internalModelValue.value = valueToSet;
  }

  emit("update:modelValue", internalModelValue.value);
  emit("change", internalModelValue.value);
}

provide<VcVariantPickerGroupContextType>("variantPickerGroupContext", {
  modelValue: internalModelValue,
  multiple,
  size,
  type,
  name,
  toggleValue,
  width,
  onKeydown,
  tabStop,
});

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== undefined) {
      internalModelValue.value = Array.isArray(newVal) ? [...newVal] : newVal;
    } else {
      internalModelValue.value = multiple.value ? [] : "";
    }
  },
  { deep: true, immediate: true },
);

watch(truncate, (enabled) => {
  if (enabled) {
    void measureAndLayout();
    return;
  }

  void expand();
});

watch(maxRows, () => {
  void measureAndLayout();
});

// Another column count can keep the group's size (one-line tiles are as tall as the +N button), so the resize
// observer may stay silent.
watch(
  () => props.columns,
  () => {
    void measureAndLayout();
  },
);

// An unbound group re-renders only its pickers on a selection, so onUpdated misses it; the checked one is read from the
// DOM, so after they render.
watch(internalModelValue, () => updateTabStop(), { flush: "post" });

// Pickers added, removed or reordered by the parent, and the +N button shown or hidden, re-render the group.
onUpdated(() => updateTabStop());

onMounted(() => {
  updateTabStop();
  void measureAndLayout();
});
</script>

<style lang="scss">
@use "@/ui-kit/styles/variant-picker-corner" as *;

.vc-variant-picker-group {
  --gap: theme("spacing.2");

  @apply flex flex-wrap gap-[--gap];

  &--columns {
    @apply grid;

    @each $count in 1, 2, 3, 4 {
      &--#{$count} {
        @apply grid-cols-#{$count};
      }
    }
  }

  // Room for the content a direct-child picker shows over its top-end corner (VcVariantPicker `corner` slot), so it
  // never covers the row above or leaves the group.
  &:has(> .vc-variant-picker--with-corner) {
    padding-top: $corner-rise;
    padding-inline-end: $corner-overhang;
    row-gap: calc(var(--gap) + #{$corner-rise});
    column-gap: calc(var(--gap) + #{$corner-overhang});
  }

  &__wrapper {
    @apply flex items-center;
  }
}
</style>
