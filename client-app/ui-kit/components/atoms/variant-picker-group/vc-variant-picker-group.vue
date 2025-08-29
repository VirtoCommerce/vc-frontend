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
    return { rowCounts: [] };
  }

  try {
    const positions = items.map((el) => el.offsetTop);
    const rowCounts: number[] = [];
    const rowTops: number[] = [];

    positions.forEach((elementTop) => {
      let matched = false;

      for (let idx = 0; idx < rowTops.length; idx++) {
        if (Math.abs(elementTop - rowTops[idx]) < LAYOUT_CONFIG.POSITION_TOLERANCE) {
          rowCounts[idx]++;
          matched = true;
          break;
        }
      }

      if (!matched) {
        rowTops.push(elementTop);
        rowCounts.push(1);
      }
    });

    return { rowCounts };
  } catch (error) {
    Logger.error("VcVariantPickerGroup: Failed to analyze items layout", error);
    return { rowCounts: [] };
  }
}

function resetItemsVisibility(items: HTMLElement[]) {
  if (!Array.isArray(items)) {
    return;
  }

  const hiddenItems = items.filter((item) => item?.classList?.contains(LAYOUT_CONFIG.HIDDEN_CLASS));
  hiddenItems.forEach((item) => item.classList.remove(LAYOUT_CONFIG.HIDDEN_CLASS));
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

function measureAndLayout() {
  if (!truncate.value || expanded.value) {
    return;
  }

  const container = containerRef.value;
  if (container === null) {
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
  showButton.value = false;

  void nextTick().then(async () => {
    let layoutInfo = analyzeItemsLayout(items);

    if (layoutInfo.rowCounts.length <= maxRows.value) {
      showButton.value = false;
      hiddenCount.value = 0;
      return;
    }

    showButton.value = true;
    await nextTick();

    let visibleIdxLimit = total;

    while (true) {
      layoutInfo = analyzeItemsLayout(items.filter((el, idx) => idx < visibleIdxLimit));

      if (layoutInfo.rowCounts.length <= maxRows.value) {
        const btnEl = moreBtn.value as HTMLElement | null;

        if (btnEl === null) {
          break;
        }

        const lastIdx = visibleIdxLimit - 1;
        const lastItemTop = lastIdx >= 0 ? items[lastIdx].offsetTop : btnEl.offsetTop;
        const btnTop = btnEl.offsetTop;

        if (Math.abs(btnTop - lastItemTop) < LAYOUT_CONFIG.POSITION_TOLERANCE) {
          break;
        }
      }

      visibleIdxLimit--;

      if (visibleIdxLimit <= 0) {
        break;
      }

      items[visibleIdxLimit].classList.add(LAYOUT_CONFIG.HIDDEN_CLASS);
      await nextTick();
    }

    updateButtonState(total, visibleIdxLimit);
  });
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
