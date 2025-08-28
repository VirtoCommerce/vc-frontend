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
  maxRows?: number;
}

const props = withDefaults(defineProps<IProps>(), {
  maxRows: 2,
});

const LAYOUT_CONFIG = {
  POSITION_TOLERANCE: 2,
  WRAPPER_CLASS: "vc-variant-picker-group__wrapper",
  RESIZE_DEBOUNCE_MS: 100,
  HIDDEN_CLASS: "hidden",
} as const;

const truncate = toRef(props, "truncate");
const maxRows = toRef(props, "maxRows");

const containerRef = ref(null);
const moreBtn = ref(null);

const expanded = ref(false);
const showButton = ref(false);
const hiddenCount = ref(0);

let resizeObserver: ResizeObserver | null = null;

function createDebouncer(func: () => void, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(func, delay);
  };
}

function getDirectItems(containerEl: HTMLElement | null) {
  if (!containerEl?.children) {
    return [];
  }

  try {
    return Array.from(containerEl.children).filter(
      (item) => item instanceof HTMLElement && !item.classList.contains(LAYOUT_CONFIG.WRAPPER_CLASS),
    ) as HTMLElement[];
  } catch (error) {
    Logger.error("VcVariantPickerGroup: Failed to get direct items", error);
    return [];
  }
}

function analyzeItemsLayout(items: HTMLElement[]) {
  if (!Array.isArray(items) || items.length === 0) {
    return { rowCounts: [], visibleInLayout: 0 };
  }

  try {
    const positions = items.map((el) => el.offsetTop);
    const rowCounts: number[] = [];
    const rowTops: number[] = [];
    let totalVisible = 0;

    for (let i = 0; i < positions.length; i++) {
      const elementTop = positions[i];
      let foundRow = false;

      for (let rowIndex = 0; rowIndex < rowTops.length; rowIndex++) {
        if (Math.abs(elementTop - rowTops[rowIndex]) < LAYOUT_CONFIG.POSITION_TOLERANCE) {
          rowCounts[rowIndex]++;
          totalVisible++;
          foundRow = true;
          break;
        }
      }

      if (!foundRow) {
        if (rowTops.length < maxRows.value) {
          rowTops.push(elementTop);
          rowCounts.push(1);
          totalVisible++;
        } else {
          break;
        }
      }
    }

    return {
      rowCounts,
      visibleInLayout: totalVisible,
    };
  } catch (error) {
    Logger.error("VcVariantPickerGroup: Failed to analyze items layout", error);
    return { rowCounts: [], visibleInLayout: 0 };
  }
}

function resetItemsVisibility(items: HTMLElement[]) {
  if (!Array.isArray(items)) {
    return;
  }

  const hiddenItems = items.filter((item) => item?.classList?.contains(LAYOUT_CONFIG.HIDDEN_CLASS));
  hiddenItems.forEach((item) => item.classList.remove(LAYOUT_CONFIG.HIDDEN_CLASS));
}

function calculateVisibleItemsCount(layoutInfo: ReturnType<typeof analyzeItemsLayout>) {
  if (!layoutInfo || typeof layoutInfo.visibleInLayout !== "number" || layoutInfo.rowCounts.length === 0) {
    return 0;
  }

  const { rowCounts } = layoutInfo;
  let totalVisible = 0;

  for (let i = 0; i < rowCounts.length; i++) {
    if (i === rowCounts.length - 1) {
      totalVisible += Math.max(0, rowCounts[i] - 1);
    } else {
      totalVisible += rowCounts[i];
    }
  }

  return Math.max(0, totalVisible);
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

function batchUpdateVisibility(items: HTMLElement[], visibleCount: number) {
  if (!Array.isArray(items) || typeof visibleCount !== "number") {
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

  itemsToShow.forEach((item) => item.classList.remove(LAYOUT_CONFIG.HIDDEN_CLASS));
  itemsToHide.forEach((item) => item.classList.add(LAYOUT_CONFIG.HIDDEN_CLASS));
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
