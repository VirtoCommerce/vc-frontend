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

// Published so a descendant (VcLoadMore) reads the same edges the reach-* events come from.
const isAtTop = ref(true);
const isAtBottom = ref(false);
const isAtLeft = ref(true);
const isAtRight = ref(false);

// Bumped on every real measurement: the edges are debounced, so a reader needs to know they are fresh.
const measuredAt = ref(0);

provide(vcScrollbarKey, { el, isAtTop, isAtBottom, isAtLeft, isAtRight, measuredAt });

// A scrollable region must be keyboard-reachable (axe: scrollable-region-focusable), but only
// when nothing inside is focusable — axe passes regions with focusable content, and a tab stop
// on e.g. an `aria-activedescendant`-driven listbox would break the combobox pattern.
// The tab stop is added automatically when content overflows on an enabled axis AND the region
// has no focusable descendants AND no interactive container role; `focusable` stays as an
// explicit override.
// Looked for inside the region too: a listbox holding only options sits inside it, not on it.
const INTERACTIVE_CONTAINER_SELECTOR = [
  "listbox",
  "menu",
  "menubar",
  "tree",
  "treegrid",
  "grid",
  "tablist",
  "combobox",
  "radiogroup",
]
  .map((role) => `[role="${role}"]`)
  .join(", ");

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

  if (target.matches(INTERACTIVE_CONTAINER_SELECTOR) || target.querySelector(INTERACTIVE_CONTAINER_SELECTOR)) {
    needsAutoTabStop.value = false;
    return;
  }

  needsAutoTabStop.value = !target.querySelector(FOCUSABLE_SELECTOR);
}

function checkContent(): void {
  updateAutoTabStop();

  if (el.value) {
    updateEdges(el.value);
  }
}

// maxWait: content that keeps changing (a spinner) would otherwise postpone the check forever.
const scheduleContentUpdate = useDebounceFn(checkContent, 100, { maxWait: 300 });

onMounted(() => {
  void nextTick(checkContent);
});

// flush: "post": a pre-flush watcher would run before these props' overflow classes (below)
// reach the DOM, reading scrollHeight/clientHeight off the still-stale layout.
// These props also decide which axes may announce, so they re-measure.
watch([() => props.vertical, () => props.horizontal, () => props.disabled], checkContent, {
  flush: "post",
});

// The element's own box (ResizeObserver) stays fixed while slot content rendered by OTHER
// components grows: structural and text changes are seen by the MutationObserver, image loads
// only by the capture-phase load listener (load doesn't bubble and isn't a mutation). Attributes
// are watched too, since FOCUSABLE_SELECTOR and the role guard both read them.
useResizeObserver(el, scheduleContentUpdate);
useMutationObserver(el, scheduleContentUpdate, {
  childList: true,
  subtree: true,
  characterData: true,
  attributes: true,
  attributeFilter: ["disabled", "tabindex", "href", "contenteditable", "role"],
});
useEventListener(el, "load", scheduleContentUpdate, { capture: true });

// Measured on content changes as well as on scroll: content that fits never scrolls. Emits
// arrivals only; whether to ask for more is the caller's decision.
function updateEdges(target: HTMLElement): Omit<VcScrollbarPayloadType, "scrollTop" | "scrollLeft"> {
  const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = target;
  const threshold = props.edgeThreshold;

  const measured = {
    isAtTop: scrollTop <= threshold,
    isAtBottom: scrollTop + clientHeight >= scrollHeight - threshold,
    isAtLeft: scrollLeft <= threshold,
    isAtRight: scrollLeft + clientWidth >= scrollWidth - threshold,
  };

  // A collapsed box (a closed popover's display:none content) sits at every edge; ignore it.
  if (!clientHeight || !clientWidth) {
    return measured;
  }

  measuredAt.value++;

  // An axis that cannot scroll sits at both edges by definition, so it announces nothing.
  const verticalScrolls = props.vertical && !props.disabled;
  const horizontalScrolls = props.horizontal && !props.disabled;

  // The refs still hold the previous measurement, which makes these arrivals rather than states.
  if (verticalScrolls && measured.isAtTop && !isAtTop.value) {
    emit("reachTop");
  }
  if (verticalScrolls && measured.isAtBottom && !isAtBottom.value) {
    emit("reachBottom");
  }
  if (horizontalScrolls && measured.isAtLeft && !isAtLeft.value) {
    emit("reachLeft");
  }
  if (horizontalScrolls && measured.isAtRight && !isAtRight.value) {
    emit("reachRight");
  }

  // Written only for axes that can emit, or enabling one later would find it already "arrived".
  if (verticalScrolls) {
    isAtTop.value = measured.isAtTop;
    isAtBottom.value = measured.isAtBottom;
  }

  if (horizontalScrolls) {
    isAtLeft.value = measured.isAtLeft;
    isAtRight.value = measured.isAtRight;
  }

  return measured;
}

const onScroll = useThrottleFn(
  (event: Event) => {
    const target = event.target as HTMLElement;
    if (!target) {
      return;
    }

    void scheduleContentUpdate();

    // Read before updateEdges runs the reach-* handlers, which may scroll.
    const { scrollTop, scrollLeft } = target;

    const edges = updateEdges(target);

    emit("scroll", { scrollTop, scrollLeft, ...edges });
  },
  100,
  true,
);

defineExpose({ el });

const _trackColor = computed(() => getColorValue(props.trackColor));
const _thumbColor = computed(() => getColorValue(props.thumbColor));
</script>

<style lang="scss">
@use "@/ui-kit/styles/focus-ring" as *;

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

  // A scroll region is size-constrained by construction, so an outset ring clips
  // against its container: invert the shared offset.
  &:focus-visible {
    @include focus-ring($inset: true);
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
