<template>
  <div
    ref="containerRef"
    class="vc-variant-picker-group"
    role="radiogroup"
    :aria-label="ariaLabelValue"
    tabindex="-1"
    @focus="($event.target as HTMLElement).blur()"
    @keydown.tab="onTabKey"
    @keydown.right.prevent="navigateBy('next', $event.target)"
    @keydown.down.prevent="navigateBy('next', $event.target)"
    @keydown.left.prevent="navigateBy('prev', $event.target)"
    @keydown.up.prevent="navigateBy('prev', $event.target)"
  >
    <slot />

    <div v-if="truncate" v-show="isButtonVisible" ref="buttonWrapperRef" class="vc-variant-picker-group__wrapper">
      <button
        ref="buttonRef"
        type="button"
        class="vc-variant-picker-group__button"
        tabindex="0"
        :aria-expanded="ariaExpandedValue"
        :aria-label="buttonAriaLabel"
        @click="expand"
      >
        +{{ hiddenCount }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn, useResizeObserver } from "@vueuse/core";
import { ref, computed, onMounted, nextTick, watch, toRef } from "vue";
import { useI18n } from "vue-i18n";
import { Logger } from "@/core/utilities";

interface IProps {
  truncate?: boolean;
  maxRows?: number;
  ariaLabel?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  maxRows: 2,
});

const LAYOUT_CONFIG = {
  POSITION_TOLERANCE: 2,
  RESIZE_DEBOUNCE_MS: 100,
};

const truncate = toRef(props, "truncate");
const maxRows = toRef(props, "maxRows");
const { t } = useI18n();

const ariaLabelValue = computed(() => props.ariaLabel ?? t("ui_kit.accessibility.variant_picker_group"));
const buttonAriaLabel = computed(() => t("ui_kit.accessibility.show_more_button", { count: hiddenCount.value }));
const containerRef = ref<HTMLElement | null>(null);
const buttonWrapperRef = ref<HTMLElement | null>(null);
const buttonRef = ref<HTMLButtonElement | null>(null);

const expanded = ref(false);
const showButton = ref(false);
const hiddenCount = ref(0);
const visibleItemsCount = ref(0);
const isButtonVisible = computed(() => truncate.value && !expanded.value && showButton.value);
const ariaExpandedValue = computed(() => (expanded.value ? "true" : "false"));

const debouncedMeasureAndLayout = useDebounceFn(measureAndLayout, LAYOUT_CONFIG.RESIZE_DEBOUNCE_MS);

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

function isButtonPositionValid(items: HTMLElement[], visibleIdxLimit: number): boolean {
  const buttonEl = buttonWrapperRef.value;

  if (buttonEl === null) {
    return true;
  }

  const lastIdx = visibleIdxLimit - 1;
  const lastItemTop = lastIdx >= 0 ? items[lastIdx].offsetTop : buttonEl.offsetTop;
  const btnTop = buttonEl.offsetTop;

  return Math.abs(btnTop - lastItemTop) < LAYOUT_CONFIG.POSITION_TOLERANCE;
}

async function findOptimalVisibleCount(items: HTMLElement[], total: number): Promise<number> {
  for (let visibleIdxLimit = total; visibleIdxLimit > 0; visibleIdxLimit--) {
    const { rowCount } = analyzeItemsLayout(items.filter((_, idx) => idx < visibleIdxLimit));

    const fits = rowCount <= maxRows.value;
    const btnValid = fits && isButtonPositionValid(items, visibleIdxLimit);

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
  if (!checkIfLayoutNeeded(items)) {
    return;
  }

  showButton.value = true;
  await nextTick();

  const visibleCount = await findOptimalVisibleCount(items, total);
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

  const input = target.querySelector<HTMLInputElement>("input.vc-variant-picker__input");
  if (input) {
    input.focus();
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
  button: HTMLButtonElement | null;
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

onMounted(() => {
  void measureAndLayout();
});
</script>

<style lang="scss">
.vc-variant-picker-group {
  @apply flex flex-wrap gap-2;

  &__wrapper {
    @apply flex items-center;
  }

  &__button {
    @apply px-1.5 py-2 min-w-8 border border-neutral-200 rounded-xl text-xs font-bold whitespace-nowrap;
  }
}
</style>
