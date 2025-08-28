<template>
  <div ref="containerRef" class="vc-variant-picker-group">
    <slot />

    <div v-if="truncate" v-show="showButton && !expanded" ref="moreBtn" class="vc-variant-picker-group__wrapper">
      <button
        type="button"
        class="vc-variant-picker-group__button"
        :aria-expanded="expanded ? 'true' : 'false'"
        :aria-label="$t('ui_kit.buttons.see_more')"
        @click="expand"
      >
        +{{ hiddenCount }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch, toRef } from "vue";
import { Logger } from "@/core/utilities";

interface IProps {
  truncate?: boolean;
}

const props = defineProps<IProps>();

const LAYOUT_CONFIG = {
  POSITION_TOLERANCE: 2,
  WRAPPER_CLASS: "vc-variant-picker-group__wrapper",
  RESIZE_DEBOUNCE_MS: 100,
  HIDDEN_CLASS: "hidden",
} as const;

const EMPTY_LAYOUT = {
  firstRowCount: 0,
  secondRowCount: 0,
  visibleInLayout: 0,
} as const;
const truncate = toRef(props, "truncate");

const containerRef = ref<HTMLElement | null>(null);
const moreBtn = ref<HTMLElement | null>(null);

const expanded = ref(false);
const showButton = ref(false);
const hiddenCount = ref(0);

let resizeObserver: ResizeObserver | null = null;

function createDebouncer<T extends (...args: unknown[]) => void>(func: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

function getDirectItems(containerEl: HTMLElement | null): HTMLElement[] {
  if (!containerEl?.children) {
    return [];
  }

  try {
    return Array.from(containerEl.children).filter((item) => {
      return item instanceof HTMLElement && !item.classList.contains(LAYOUT_CONFIG.WRAPPER_CLASS);
    }) as HTMLElement[];
  } catch (error) {
    Logger.error("VcVariantPickerGroup: Failed to get direct items", error);
    return [];
  }
}

function analyzeItemsLayout(items: HTMLElement[]) {
  if (!Array.isArray(items) || items.length === 0) {
    return EMPTY_LAYOUT;
  }

  try {
    const positions = items.map(el => el.offsetTop);
    const firstTop = positions[0];
    let firstRowCount = 0;
    let secondRowCount = 0;
    let secondRowTop = null;

    for (let i = 0; i < positions.length; i++) {
      const elementTop = positions[i];

      if (Math.abs(elementTop - firstTop) < LAYOUT_CONFIG.POSITION_TOLERANCE) {
        firstRowCount++;
      } else if (secondRowTop === null) {
        secondRowTop = elementTop;
        secondRowCount = 1;
      } else if (Math.abs(elementTop - secondRowTop) < LAYOUT_CONFIG.POSITION_TOLERANCE) {
        secondRowCount++;
      } else {
        break;
      }
    }

    return {
      firstRowCount,
      secondRowCount,
      visibleInLayout: firstRowCount + secondRowCount,
    };
  } catch (error) {
    Logger.error("VcVariantPickerGroup: Failed to analyze items layout", error);
    return EMPTY_LAYOUT;
  }
}

function resetItemsVisibility(items: HTMLElement[]) {
  if (!Array.isArray(items)) {
    return;
  }

  const hiddenItems = items.filter(item =>
    item?.classList?.contains(LAYOUT_CONFIG.HIDDEN_CLASS)
  );
  hiddenItems.forEach(item => item.classList.remove(LAYOUT_CONFIG.HIDDEN_CLASS));
}

function calculateVisibleItemsCount(layoutInfo: ReturnType<typeof analyzeItemsLayout>) {
  if (!layoutInfo || typeof layoutInfo.visibleInLayout !== 'number') {
    return 0;
  }

  let visibleItems = Math.max(0, layoutInfo.visibleInLayout);

  if (layoutInfo.secondRowCount > 0) {
    visibleItems = layoutInfo.firstRowCount + Math.max(0, layoutInfo.secondRowCount - 1);
  } else if (layoutInfo.firstRowCount > 1) {
    visibleItems = Math.max(1, layoutInfo.firstRowCount - 1);
  }

  return Math.max(0, visibleItems);
}

function updateButtonState(totalItems: number, visibleItems: number) {
  const finalHidden = Math.max(0, (totalItems || 0) - (visibleItems || 0));

  if (finalHidden > 0) {
    showButton.value = true;
    hiddenCount.value = finalHidden;
  } else {
    showButton.value = false;
    hiddenCount.value = 0;
  }
}

function batchUpdateVisibility(items: HTMLElement[], visibleCount: number) {
  if (!Array.isArray(items) || typeof visibleCount !== 'number') {
    return;
  }

  const itemsToShow: HTMLElement[] = [];
  const itemsToHide: HTMLElement[] = [];
  const safeVisibleCount = Math.max(0, visibleCount);

  items.forEach((node, idx) => {
    if (!node?.classList) return;

    if (!expanded.value && idx >= safeVisibleCount) {
      if (!node.classList.contains(LAYOUT_CONFIG.HIDDEN_CLASS)) {
        itemsToHide.push(node);
      }
    } else {
      if (node.classList.contains(LAYOUT_CONFIG.HIDDEN_CLASS)) {
        itemsToShow.push(node);
      }
    }
  });

  itemsToShow.forEach(item => item.classList.remove(LAYOUT_CONFIG.HIDDEN_CLASS));
  itemsToHide.forEach(item => item.classList.add(LAYOUT_CONFIG.HIDDEN_CLASS));
}

function measureAndLayout() {
  if (!truncate.value || expanded.value) {
    return;
  }

  const container = containerRef.value;
  const btnEl = moreBtn.value;

  if (container === null || btnEl === null) {
    return;
  }

  const items = getDirectItems(container);
  const total = items.length;

  if (total === 0) {
    showButton.value = false;
    hiddenCount.value = 0;
    return;
  }

  resetItemsVisibility(items);

  const layoutInfo = analyzeItemsLayout(items);

  if (total <= layoutInfo.visibleInLayout) {
    showButton.value = false;
    hiddenCount.value = 0;
    return;
  }

  const visibleItems = calculateVisibleItemsCount(layoutInfo);
  updateButtonState(total, visibleItems);
  batchUpdateVisibility(items, visibleItems);
}

function expand() {
  expanded.value = true;
  showButton.value = false;
  const el = containerRef.value;

  if (el === null) {
    return;
  }

  const items = getDirectItems(el);
  resetItemsVisibility(items);
}

watch(truncate, (val) => {
  void nextTick().then(val ? measureAndLayout : expand);
});

const debouncedMeasureAndLayout = createDebouncer(measureAndLayout, LAYOUT_CONFIG.RESIZE_DEBOUNCE_MS);

onMounted(async () => {
  await nextTick();
  measureAndLayout();

  resizeObserver = new ResizeObserver(() => {
    debouncedMeasureAndLayout();
  });

  if (containerRef.value) {
    resizeObserver.observe(containerRef.value);
  }
});

onBeforeUnmount(() => {
  if (resizeObserver && containerRef.value) {
    resizeObserver.unobserve(containerRef.value);
  }

  if (resizeObserver) {
    resizeObserver.disconnect();
  }
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
