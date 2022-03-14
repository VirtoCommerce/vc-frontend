<template>
  <div ref="target" class="text-center h-[70px]">
    <slot v-if="loading" name="loader">
      <span class="scale-125 inline-block pt-px">
        <img src="/static/images/loader.png" class="inline-block animate-spin" alt="spinner" width="24" height="24" />
      </span>
    </slot>

    <slot v-else name="loaded">
      <p class="inline-flex items-center">
        <svg width="29" height="29" class="inline-block text-primary">
          <use href="/static/images/badge-check.svg#badge-check" />
        </svg>

        <span class="ml-3">You have reached the end of the list</span>
      </p>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, PropType, shallowRef, watch } from "vue";

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
    await nextTick();
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
