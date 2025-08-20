<template>
  <div ref="containerRef" class="vc-variant-picker-group">
    <slot />

    <div v-if="truncate" v-show="showButton && !expanded" ref="moreBtn" class="vc-variant-picker-group__wrapper">
      <button type="button" class="vc-variant-picker-group__button" @click="expand">+{{ hiddenCount }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";

interface IProps {
  truncate?: boolean;
}

const props = defineProps<IProps>();

const containerRef = ref<HTMLElement | null>(null);
const moreBtn = ref<HTMLElement | null>(null);

const expanded = ref(false);
const showButton = ref(false);
const hiddenCount = ref(0);

let ro: ResizeObserver | null = null;

function getDirectItems(containerEl: HTMLElement): HTMLElement[] {
  return Array.from(containerEl.children).filter((item) => {
    return item != moreBtn.value;
  }) as HTMLElement[];
}

function countColumnsByRows(items: HTMLElement[]) {
  if (items.length === 0) {
    return 1;
  }

  const firstTop = items[0].offsetTop;
  let cols = 0;

  for (const el of items) {
    if (Math.abs(el.offsetTop - firstTop) < 1) {
      cols++;
    } else {
      break;
    }
  }

  if (cols < 1) {
    return 1;
  }

  return cols;
}

function measureBtnWidthFor(btnWrapper: HTMLElement, count: number) {
  const label = btnWrapper.querySelector("button") || btnWrapper;

  const wasHidden = getComputedStyle(btnWrapper).display === "none";

  if (wasHidden) {
    btnWrapper.style.visibility = "hidden";
    btnWrapper.style.display = "block";
  }

  const prevGrid = btnWrapper.style.gridColumn;
  btnWrapper.style.gridColumn = "span 1";

  const prevText = label.textContent ?? "";
  const prevWidth = label.style.width;
  const prevDisplay = label.style.display;
  const width = label.getBoundingClientRect().width;

  label.textContent = `+${count}`;
  label.style.width = "auto";
  label.style.display = "inline-block";
  label.textContent = prevText;
  label.style.width = prevWidth;
  label.style.display = prevDisplay;
  btnWrapper.style.gridColumn = prevGrid;

  if (wasHidden) {
    btnWrapper.style.display = "";
    btnWrapper.style.visibility = "";
  }
  return width;
}

function spanForWidth(width: number, track: number, gap: number, maxCols: number) {
  const k = Math.ceil((width + gap) / (track + gap));

  if (k < 1) {
    return 1;
  }

  if (k > maxCols) {
    return maxCols;
  }

  return k;
}

function measureAndLayout() {
  if (!props.truncate || expanded.value) {
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

  for (const i of items) {
    i.classList.remove("hidden");
  }

  btnEl.style.setProperty("--btn-span", "1");

  const cs = getComputedStyle(container);
  const colGap = parseFloat(cs.columnGap || cs.gap || "0");

  const columns = countColumnsByRows(items);
  const trackWidth = items[0].getBoundingClientRect().width || 1;

  let tmpSpan = 1;
  let visible = Math.min(total, columns + Math.max(0, columns - tmpSpan));
  let tmpHidden = Math.max(0, total - visible);

  const btnWidth = measureBtnWidthFor(btnEl, tmpHidden);
  tmpSpan = spanForWidth(btnWidth, trackWidth, colGap, columns);

  visible = Math.min(total, columns + Math.max(0, columns - tmpSpan));
  const finalHidden = Math.max(0, total - visible);

  if (total > visible) {
    showButton.value = true;
    hiddenCount.value = finalHidden;
    btnEl.style.setProperty("--btn-span", String(tmpSpan));
  } else {
    showButton.value = false;
    hiddenCount.value = 0;
    btnEl.style.setProperty("--btn-span", "1");
  }

  items.forEach((node, idx) => {
    if (!expanded.value && idx >= visible) {
      node.classList.add("hidden");
    } else {
      node.classList.remove("hidden");
    }
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

  for (const n of items) {
    n.classList.remove("hidden");
  }
}

onMounted(async () => {
  await nextTick();
  measureAndLayout();

  ro = new ResizeObserver(() => {
    measureAndLayout();
  });

  if (containerRef.value) {
    ro.observe(containerRef.value);
  }
});

onBeforeUnmount(() => {
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
  @apply grid gap-2 items-stretch;

  grid-template-columns: repeat(auto-fill, minmax(var(--cell-min, 120px), 1fr));

  &__wrapper {
    @apply flex items-center;

    grid-column: span var(--btn-span, 1);
  }

  &__button {
    @apply px-1.5 py-2 border border-neutral-200 rounded-xl text-xs font-bold;
  }
}
</style>
