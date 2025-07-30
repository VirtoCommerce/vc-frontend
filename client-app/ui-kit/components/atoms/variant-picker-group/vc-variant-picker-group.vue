<template>
  <div ref="containerRef" class="vc-variant-picker-group" :data-test-id="testIdInput">
    <slot />

    <div v-if="truncate" v-show="showButton && !expanded" ref="moreBtn" class="vc-variant-picker-group__button-wrapper">
      <button type="button" class="vc-variant-picker-group__show-more" @click="expand">+{{ hiddenCount }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onBeforeUnmount } from "vue";

interface IProps {
  testIdInput?: string;
  truncate?: boolean;
}
const props = defineProps<IProps>();

const containerRef = ref<HTMLElement | null>(null);
const moreBtn = ref<HTMLButtonElement | null>(null);

const showButton = ref(false);
const expanded = ref(false);
const hiddenCount = ref(0);

let ro: ResizeObserver;

const visibleItems = () =>
  Array.from(containerRef.value?.children ?? []).filter(
    (el) => el != moreBtn.value && (el as HTMLElement).style.display !== "none",
  ) as HTMLElement[];

const firstTop = () => visibleItems()[0].offsetTop;

const secondTop = () => {
  const _firstTop = firstTop();
  const tops = visibleItems()
    .map((el) => el.offsetTop)
    .filter((t) => t > _firstTop);
  return tops.length ? Math.min(...tops) : _firstTop;
};

async function calculateVisible() {
  const btn = moreBtn.value;

  if (!props.truncate || !btn) {
    return;
  }

  const items = Array.from(containerRef.value!.children).filter((el) => el !== btn) as HTMLElement[];

  if (!items.length) {
    return;
  }

  items.forEach((el) => (el.style.display = ""));
  btn.style.display = "";
  btn.style.visibility = "hidden";
  await nextTick();

  const fitsAll = btn.offsetTop <= secondTop() && visibleItems().every((el) => el.offsetTop <= secondTop());

  if (fitsAll) {
    showButton.value = false;
    btn.style.display = "none";
    btn.style.visibility = "hidden";
    return;
  }

  showButton.value = !expanded.value;

  if (expanded.value) {
    btn.style.display = "none";
    return;
  }

  for (let i = items.length - 1; i >= 0 && btn.offsetTop > secondTop(); i--) {
    items[i].style.display = "none";
    btn.getBoundingClientRect();
  }

  for (let i = 0; i < items.length && btn.offsetTop <= secondTop(); i++) {
    if (items[i].style.display === "none") {
      items[i].style.display = "";
      btn.getBoundingClientRect();

      if (btn.offsetTop > secondTop()) {
        items[i].style.display = "none";
        break;
      }
    }
  }

  btn.style.visibility = "visible";
  hiddenCount.value = items.filter((el) => el.style.display === "none").length;
}

function expand() {
  expanded.value = true;
  showButton.value = false;

  const container = containerRef.value;
  const btn = moreBtn.value;
  if (!container || !btn) {
    return;
  }

  const slotItems = Array.from(container.children).filter((el) => el !== btn) as HTMLElement[];

  slotItems.forEach((el) => (el.style.display = ""));

  btn.style.display = "none";

  void nextTick(() => calculateVisible());
}

onMounted(() => {
  void nextTick(async () => {
    await calculateVisible();

    await document.fonts.ready;
    await calculateVisible();

    ro = new ResizeObserver(calculateVisible);

    if (containerRef.value) {
      ro.observe(containerRef.value);
    }

    window.addEventListener("resize", calculateVisible);
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", calculateVisible);
  if (containerRef.value && ro) {
    ro.unobserve(containerRef.value);
  }
});
</script>

<style lang="scss">
.vc-variant-picker-group {
  @apply flex flex-wrap gap-2.5;

  &__button-wrapper {
    @apply flex flex-col justify-center;
  }

  &__show-more {
    @apply px-1.5 py-2 min-w-8 border border-neutral-200 rounded-xl text-xs font-bold;
  }
}
</style>
