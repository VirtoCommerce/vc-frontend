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

interface IProps {
  truncate?: boolean;
}

const props = defineProps<IProps>();

const LAYOUT_CONFIG = {
  POSITION_TOLERANCE: 2,
  WRAPPER_CLASS: "vc-variant-picker-group__wrapper",
  RESIZE_DEBOUNCE_MS: 100,
} as const;
const truncate = toRef(props, "truncate");

const containerRef = ref<HTMLElement | null>(null);
const moreBtn = ref<HTMLElement | null>(null);

const expanded = ref(false);
const showButton = ref(false);
const hiddenCount = ref(0);

let ro: ResizeObserver | null = null;
let resizeTimeoutId: ReturnType<typeof setTimeout> | null = null;

function debounce<T extends (...args: unknown[]) => void>(func: T, delay: number): T {
  return ((...args: Parameters<T>) => {
    if (resizeTimeoutId) {
      clearTimeout(resizeTimeoutId);
    }
    resizeTimeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

function getDirectItems(containerEl: HTMLElement): HTMLElement[] {
  return Array.from(containerEl.children).filter((item) => {
    return !item.classList.contains(LAYOUT_CONFIG.WRAPPER_CLASS);
  }) as HTMLElement[];
}

function analyzeItemsLayout(items: HTMLElement[]) {
  if (items.length === 0) {
    return { firstRowCount: 0, secondRowCount: 0, visibleInLayout: 0 };
  }

  const firstTop = items[0].offsetTop;
  let firstRowCount = 0;
  let secondRowCount = 0;
  let secondRowTop = null;

  for (const el of items) {
    const elementTop = el.offsetTop;

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
}

function applyVisibility(items: HTMLElement[], visibleCount: number) {
  items.forEach((node, idx) => {
    if (!expanded.value && idx >= visibleCount) {
      node.classList.add("hidden");
    } else {
      node.classList.remove("hidden");
    }
  });
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

  for (const item of items) {
    item.classList.remove("hidden");
  }

  const layoutInfo = analyzeItemsLayout(items);

  if (total <= layoutInfo.visibleInLayout) {
    showButton.value = false;
    hiddenCount.value = 0;
    return;
  }

  let visibleItems = layoutInfo.visibleInLayout;

  if (layoutInfo.secondRowCount > 0) {
    visibleItems = layoutInfo.firstRowCount + Math.max(0, layoutInfo.secondRowCount - 1);
  } else if (layoutInfo.firstRowCount > 1) {
    visibleItems = Math.max(1, layoutInfo.firstRowCount - 1);
  }

  const finalHidden = Math.max(0, total - visibleItems);

  if (finalHidden > 0) {
    showButton.value = true;
    hiddenCount.value = finalHidden;
  } else {
    showButton.value = false;
    hiddenCount.value = 0;
  }

  applyVisibility(items, visibleItems);
}

function expand() {
  expanded.value = true;
  showButton.value = false;
  const el = containerRef.value;

  if (el === null) {
    return;
  }

  const items = getDirectItems(el);

  for (const n of items) {
    n.classList.remove("hidden");
  }
}

watch(truncate, (val) => {
  void nextTick().then(val ? measureAndLayout : expand);
});

const debouncedMeasureAndLayout = debounce(measureAndLayout, LAYOUT_CONFIG.RESIZE_DEBOUNCE_MS);

onMounted(async () => {
  await nextTick();
  measureAndLayout();

  ro = new ResizeObserver(() => {
    debouncedMeasureAndLayout();
  });

  if (containerRef.value) {
    ro.observe(containerRef.value);
  }
});

onBeforeUnmount(() => {
  if (resizeTimeoutId) {
    clearTimeout(resizeTimeoutId);
    resizeTimeoutId = null;
  }

  if (ro && containerRef.value) {
    ro.unobserve(containerRef.value);
  }

  if (ro) {
    ro.disconnect();
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
