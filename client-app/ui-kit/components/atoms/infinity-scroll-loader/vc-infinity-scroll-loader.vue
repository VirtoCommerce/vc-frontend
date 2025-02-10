<template>
  <div ref="target" class="flex items-center justify-center gap-2 text-base">
    <div>
      <div>isPageLimitReached {{ isPageLimitReached }}</div>
      <div>pageNumber {{ pageNumber }}</div>
      <div>pagesCount {{ pagesCount }}</div>
      <div>loading {{ loading }}</div>
    </div>
    <slot v-if="loading" name="loader">
      <VcLoader />
    </slot>
    <slot v-else name="loaded">
      <VcIcon v-if="isPageLimitReached || pageNumber === pagesCount" class="size-7 fill-primary" name="badge-check" />

      <span v-if="isPageLimitReached">{{ $t("ui_kit.reach_limit.page_limit_filters") }}</span>
      <span v-else-if="pageNumber === pagesCount">{{ $t("ui_kit.reach_limit.end_list") }}</span>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, shallowRef, watch } from "vue";

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  loading: true,
  viewport: null,
  distance: 0,
});

interface IEmits {
  (event: "visible"): void;
}

interface IProps {
  loading?: boolean;
  viewport?: Element | Document | null;
  distance?: string | number;
  isPageLimitReached?: boolean;
  pagesCount: number;
  pageNumber: number;
}

let observer: IntersectionObserver | null = null;
const target = shallowRef<HTMLElement | null>(null);

function intersectionCallback([entry]: IntersectionObserverEntry[]): void {
  if (entry.isIntersecting) {
    emit("visible");
  }
}

function initObserver(): void {
  if (observer) {
    observer.disconnect();
  }

  observer = new IntersectionObserver(intersectionCallback, {
    root: props.viewport,
    rootMargin: `${props.distance}px`,
  });

  observer.observe(target.value!);
}

onMounted(() => {
  initObserver();
  document.documentElement.style.setProperty("overflow-anchor", "none");
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
  document.documentElement.style.removeProperty("overflow-anchor");
});

watch(() => [props.viewport, props.distance], initObserver);
</script>
