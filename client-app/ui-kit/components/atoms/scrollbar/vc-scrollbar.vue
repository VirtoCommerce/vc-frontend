<template>
  <component
    :is="tag"
    ref="el"
    :data-test-id="testId"
    :tabindex="isFocusable ? 0 : undefined"
    :class="[
      'vc-scrollbar',
      {
        'vc-scrollbar--vertical': vertical,
        'vc-scrollbar--horizontal': horizontal,
        'vc-scrollbar--disabled': disabled,
        'vc-scrollbar--no-bar': noBar,
      },
    ]"
    @scroll="onScroll"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { useResizeObserver, useThrottleFn } from "@vueuse/core";
import { computed, nextTick, onMounted, onUpdated, provide, ref, useTemplateRef } from "vue";
import { getColorValue } from "@/ui-kit/utilities";
import { vcScrollbarKey } from "./vc-scrollbar-context";

interface IEmits {
  (event: "reachTop"): void;
  (event: "reachBottom"): void;
  (event: "reachLeft"): void;
  (event: "reachRight"): void;
  (event: "scroll", payload: VcScrollbarPayloadType): void;
}

interface IProps {
  disabled?: boolean;
  vertical?: boolean;
  horizontal?: boolean;
  noBar?: boolean;
  focusable?: boolean;
  tag?: string;
  trackColor?: string;
  thumbColor?: string;
  edgeThreshold?: number;
  testId?: string;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  vertical: false,
  horizontal: false,
  disabled: false,
  noBar: false,
  focusable: false,
  tag: "div",
  edgeThreshold: 0,
});

const el = useTemplateRef<HTMLElement>("el");

provide(vcScrollbarKey, { el });

// A scrollable region must be keyboard-reachable (axe: scrollable-region-focusable).
// The tab stop is added automatically when content actually overflows on an enabled axis;
// the `focusable` prop remains as an explicit override.
const hasOverflow = ref(false);

const isFocusable = computed(
  () => props.focusable || ((props.vertical || props.horizontal) && !props.disabled && hasOverflow.value),
);

function updateOverflow(): void {
  const target = el.value;
  if (!target) {
    hasOverflow.value = false;
    return;
  }

  const verticalOverflow = props.vertical && target.scrollHeight > target.clientHeight;
  const horizontalOverflow = props.horizontal && target.scrollWidth > target.clientWidth;

  hasOverflow.value = verticalOverflow || horizontalOverflow;
}

onMounted(() => {
  void nextTick(updateOverflow);
});

onUpdated(updateOverflow);

useResizeObserver(el, updateOverflow);

const wasAtTop = ref(true);
const wasAtBottom = ref(false);
const wasAtLeft = ref(true);
const wasAtRight = ref(false);

const onScroll = useThrottleFn(
  (event: Event) => {
    const target = event.target as HTMLElement;
    if (!target) {
      return;
    }

    updateOverflow();

    const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = target;
    const threshold = props.edgeThreshold;

    const isAtTop = scrollTop <= threshold;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - threshold;
    const isAtLeft = scrollLeft <= threshold;
    const isAtRight = scrollLeft + clientWidth >= scrollWidth - threshold;

    if (isAtTop && !wasAtTop.value) {
      emit("reachTop");
    }
    if (isAtBottom && !wasAtBottom.value) {
      emit("reachBottom");
    }
    if (isAtLeft && !wasAtLeft.value) {
      emit("reachLeft");
    }
    if (isAtRight && !wasAtRight.value) {
      emit("reachRight");
    }

    wasAtTop.value = isAtTop;
    wasAtBottom.value = isAtBottom;
    wasAtLeft.value = isAtLeft;
    wasAtRight.value = isAtRight;

    emit("scroll", {
      scrollTop,
      scrollLeft,
      isAtTop,
      isAtBottom,
      isAtLeft,
      isAtRight,
    });
  },
  100,
  true,
);

defineExpose({ el });

const _trackColor = computed(() => getColorValue(props.trackColor));
const _thumbColor = computed(() => getColorValue(props.thumbColor));
</script>

<style lang="scss">
.vc-scrollbar {
  $vertical: "";
  $horizontal: "";
  $disabled: "";
  $no-bar: "";

  --props-track-color: v-bind(_trackColor);
  --track-color: var(--vc-scrollbar-track-color, var(--props-track-color, theme("colors.neutral.100")));

  --props-thumb-color: v-bind(_thumbColor);
  --thumb-color: var(--vc-scrollbar-thumb-color, var(--props-thumb-color, theme("colors.neutral.400")));

  overflow: unset;

  &:focus-visible {
    @apply outline outline-2 -outline-offset-2 outline-[--color-primary-500];
  }

  &--vertical {
    $vertical: &;

    @apply overflow-y-auto;
  }

  &--horizontal {
    $horizontal: &;

    @apply overflow-x-auto;
  }

  &--disabled {
    $disabled: &;

    @apply overflow-hidden !important;
  }

  &--no-bar {
    $no-bar: &;

    /* Firefox */
    scrollbar-width: none;

    /* IE and Edge */
    -ms-overflow-style: none;

    /* WebKit browsers (Chrome, Safari) */
    &::-webkit-scrollbar {
      @apply hidden;
    }
  }

  &#{$vertical}:not(#{$horizontal}) {
    @apply overflow-x-hidden;
  }

  &#{$horizontal}:not(#{$vertical}) {
    @apply overflow-y-hidden;
  }

  &#{$horizontal}:not(#{$no-bar}),
  &#{$vertical}:not(#{$no-bar}) {
    scroll-behavior: smooth;

    /* Firefox */
    @supports not selector(::-webkit-scrollbar) {
      scrollbar-gutter: stable;
      scrollbar-width: thin;
      scrollbar-color: var(--thumb-color) var(--track-color);
    }

    /* webkit */
    &:hover {
      &::-webkit-scrollbar-track {
        @apply opacity-100;
      }

      &::-webkit-scrollbar-thumb {
        @apply opacity-100;
      }
    }

    &::-webkit-scrollbar {
      @apply size-1.5;
    }

    &::-webkit-scrollbar-track {
      @apply bg-[--track-color] opacity-70 rounded;
    }

    &::-webkit-scrollbar-thumb {
      @apply bg-[--thumb-color] opacity-70 rounded;
    }
  }
}
</style>
