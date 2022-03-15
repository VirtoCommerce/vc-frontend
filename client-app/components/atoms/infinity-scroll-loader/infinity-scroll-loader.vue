<template>
  <div ref="target">
    <slot v-if="loading" name="loader">
      <p class="flex items-center justify-center">
        <img src="/static/images/loader.png" class="inline-block animate-spin" alt="spinner" width="29" height="29" />
      </p>
    </slot>

    <slot v-else name="loaded">
      <p class="flex items-center justify-center">
        <svg width="29" height="29" class="inline-block text-primary">
          <use href="/static/images/badge-check.svg#badge-check" />
        </svg>

        <span class="ml-3">You have reached the end of the list</span>
      </p>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, PropType, shallowRef, watch } from "vue";

const emit = defineEmits<{ (event: "visible"): void }>();

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },

  viewport: {
    type: Object as PropType<Element | Document | null>,
    default: null,
  },

  distance: {
    type: [Number, String],
    default: 0,
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
