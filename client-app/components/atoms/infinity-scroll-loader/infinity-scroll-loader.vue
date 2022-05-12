<template>
  <div ref="target" :class="$attrs.class">
    <slot v-if="isLoading" name="loader">
      <div class="flex items-center justify-center">
        <img
          src="/static/images/loader.png"
          class="inline-block animate-spin"
          alt="spinner"
          width="29"
          height="29"
          loading="lazy"
        />
      </div>
    </slot>

    <slot v-else name="loaded">
      <div class="flex items-center justify-center">
        <svg width="29" height="29" class="inline-block text-primary">
          <use href="/static/images/badge-check.svg#badge-check" />
        </svg>

        <span class="ml-3">{{ $t("common.messages.infinity_scroll_end") }}</span>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
/**
 * Infinity scroll trigger with loader.
 */

import { onBeforeUnmount, onMounted, PropType, shallowRef, watch } from "vue";

const emit = defineEmits<{ (event: "visible"): void }>();

const props = defineProps({
  /**
   * Set scrollable area within component should be observed.
   */
  viewport: {
    type: Object as PropType<Element | Document | null>,
    default: null,
  },

  /**
   * Set ahead distance to trigger loading.
   */
  threshold: {
    type: Number,
    default: 0,
  },

  /**
   * Toggle loading state.
   */
  isLoading: {
    type: Boolean,
    default: false,
  },
});

let observer: IntersectionObserver | null = null;
const target = shallowRef<HTMLElement | null>(null);

function intersectionCallback([entry]: IntersectionObserverEntry[]): void {
  if (entry.isIntersecting) {
    emit("visible");
  }
}

async function initObserver() {
  if (observer) {
    observer.disconnect();
  }

  observer = new IntersectionObserver(intersectionCallback, {
    root: props.viewport,
    rootMargin: `${props.threshold}px`,
  });

  observer.observe(target.value!);
}

onMounted(initObserver);

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
});

watch(() => [props.viewport, props.threshold], initObserver);
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
};
</script>
