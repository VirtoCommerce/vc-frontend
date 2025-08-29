<template>
  <div ref="containerRef" class="vc-variant-picker-group">
    <slot />

    <div v-if="truncate" v-show="isButtonVisible" ref="moreBtn" class="vc-variant-picker-group__wrapper">
      <button
        type="button"
        class="vc-variant-picker-group__button"
        :aria-expanded="ariaExpandedValue"
        :aria-label="$t('ui_kit.buttons.see_more')"
        @click="expand"
      >
        +{{ hiddenCount }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch, toRef } from "vue";
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
};

const truncate = toRef(props, "truncate");
const maxRows = toRef(props, "maxRows");

const containerRef = ref<HTMLElement | null>(null);
const moreBtn = ref<HTMLElement | null>(null);

const expanded = ref(false);
const showButton = ref(false);
const hiddenCount = ref(0);

const isButtonVisible = computed(() =>
  truncate.value && !expanded.value && showButton.value
);

const ariaExpandedValue = computed(() =>
  expanded.value ? "true" : "false"
);

let resizeObserver: ResizeObserver | null = null;
let debounceTimeoutId: ReturnType<typeof setTimeout> | null = null;

function cleanupResizeObserver() {
  if (resizeObserver) {
    if (containerRef.value) {
      resizeObserver.unobserve(containerRef.value);
    }
    resizeObserver.disconnect();
    resizeObserver = null;
  }
}

function createDebouncer(func: () => void, delay: number) {
  return () => {
    if (debounceTimeoutId) {
      clearTimeout(debounceTimeoutId);
    }
    debounceTimeoutId = setTimeout(func, delay);
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
        const btnEl = moreBtn.value;

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

      items[visibleIdxLimit].style.display = "none";
      await nextTick();
    }

    updateButtonState(total, visibleIdxLimit);
  });
}

function expand() {
  expanded.value = true;
  showButton.value = false;

  cleanupResizeObserver();

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

watch(maxRows, () => {
  void nextTick().then(measureAndLayout);
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
  cleanupResizeObserver();

  if (debounceTimeoutId) {
    clearTimeout(debounceTimeoutId);
    debounceTimeoutId = null;
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
