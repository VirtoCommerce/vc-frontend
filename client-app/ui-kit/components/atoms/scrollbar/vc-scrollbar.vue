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
import { useDebounceFn, useEventListener, useMutationObserver, useResizeObserver, useThrottleFn } from "@vueuse/core";
import { computed, nextTick, onMounted, provide, ref, useTemplateRef, watch } from "vue";
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

// A scrollable region must be keyboard-reachable (axe: scrollable-region-focusable), but only
// when nothing inside is focusable — axe passes regions with focusable content, and a tab stop
// on e.g. an `aria-activedescendant`-driven listbox would break the combobox pattern.
// The tab stop is added automatically when content overflows on an enabled axis AND the region
// has no focusable descendants AND no interactive container role; `focusable` stays as an
// explicit override.
const INTERACTIVE_CONTAINER_ROLES = new Set([
  "listbox",
  "menu",
  "menubar",
  "tree",
  "treegrid",
  "grid",
  "tablist",
  "combobox",
  "radiogroup",
]);

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
  "audio[controls]",
  "video[controls]",
  "summary",
  "iframe",
].join(", ");

const needsAutoTabStop = ref(false);

const isFocusable = computed(() => props.focusable || needsAutoTabStop.value);

function updateAutoTabStop(): void {
  const target = el.value;

  if (!target || props.disabled || (!props.vertical && !props.horizontal)) {
    needsAutoTabStop.value = false;
    return;
  }

  const overflows =
    (props.vertical && target.scrollHeight > target.clientHeight) ||
    (props.horizontal && target.scrollWidth > target.clientWidth);

  if (!overflows) {
    needsAutoTabStop.value = false;
    return;
  }

  const role = target.getAttribute("role");
  if (role && INTERACTIVE_CONTAINER_ROLES.has(role)) {
    needsAutoTabStop.value = false;
    return;
  }

  needsAutoTabStop.value = !target.querySelector(FOCUSABLE_SELECTOR);
}

const scheduleAutoTabStopUpdate = useDebounceFn(updateAutoTabStop, 100);

onMounted(() => {
  void nextTick(updateAutoTabStop);
});

// flush: "post": a pre-flush watcher would run before these props' overflow classes (below)
// reach the DOM, reading scrollHeight/clientHeight off the still-stale layout.
watch([() => props.vertical, () => props.horizontal, () => props.disabled], updateAutoTabStop, {
  flush: "post",
});

// The element's own box (ResizeObserver) stays fixed while slot content rendered by OTHER
// components grows: structural and text changes are seen by the MutationObserver, image loads
// only by the capture-phase load listener (load doesn't bubble and isn't a mutation). Attributes
// are watched too, since FOCUSABLE_SELECTOR and the role guard both read them.
useResizeObserver(el, scheduleAutoTabStopUpdate);
useMutationObserver(el, scheduleAutoTabStopUpdate, {
  childList: true,
  subtree: true,
  characterData: true,
  attributes: true,
  attributeFilter: ["disabled", "tabindex", "href", "contenteditable", "role"],
});
useEventListener(el, "load", scheduleAutoTabStopUpdate, { capture: true });

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

    void scheduleAutoTabStopUpdate();

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
