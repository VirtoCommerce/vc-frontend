<template>
  <div ref="target">
    <slot v-if="loading" name="loader">
      <p class="flex items-center justify-center">
        <img
          src="/static/images/loader.webp"
          class="inline-block animate-spin"
          alt="spinner"
          width="29"
          height="29"
          loading="lazy"
        />
      </p>
    </slot>

    <slot v-else name="loaded">
      <p class="flex items-center justify-center">
        <svg width="29" height="29" class="inline-block text-primary">
          <use href="/static/images/badge-check.svg#badge-check" />
        </svg>

        <span v-if="isPageLimitReached" class="ml-3">{{ $t("ui_kit.reach_limit.page_limit") }}</span>
        <span v-else class="ml-3">{{ $t("ui_kit.reach_limit.end_list") }}</span>
      </p>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, shallowRef, watch } from "vue";

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  loading: false,
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

onMounted(initObserver);

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
});

watch(() => [props.viewport, props.distance], initObserver);
</script>
