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

// The edges the region is resting against, as of the last measurement. They are the state the
// reach-* events are derived from, published so that a descendant deciding something from them —
// VcLoadMore asking for the next page — reads the same numbers rather than measuring its own.
// Pre-measurement defaults describe an unscrolled region that has not reached its end.
const isAtTop = ref(true);
const isAtBottom = ref(false);
const isAtLeft = ref(true);
const isAtRight = ref(false);

// Bumped every time the edges above are re-read from a real box. A descendant deciding something
// from them needs to know not just WHERE the region rests but WHEN that was established: the
// measurement runs behind a debounce, so between a content change and the next measurement the
// edges describe a box that no longer exists.
const measuredAt = ref(0);

provide(vcScrollbarKey, { el, isAtTop, isAtBottom, isAtLeft, isAtRight, measuredAt });

// A scrollable region must be keyboard-reachable (axe: scrollable-region-focusable), but only
// when nothing inside is focusable — axe passes regions with focusable content, and a tab stop
// on e.g. an `aria-activedescendant`-driven listbox would break the combobox pattern.
// The tab stop is added automatically when content overflows on an enabled axis AND the region
// has no focusable descendants AND no interactive container role; `focusable` stays as an
// explicit override.
// The role is looked for inside the region as well as on it: a listbox that owns only options
// has to wrap in one of these regions rather than be it, and its keyboard model is the same
// whichever of the two elements carries the role.
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

// maxWait: a region whose content keeps changing — a spinner, a live counter — restarts a plain
// debounce forever and the check never runs at all.
const scheduleContentUpdate = useDebounceFn(checkContent, 100, { maxWait: 300 });

onMounted(() => {
  void nextTick(checkContent);
});

// flush: "post": a pre-flush watcher would run before these props' overflow classes (below)
// reach the DOM, reading scrollHeight/clientHeight off the still-stale layout.
// checkContent, not just the tab stop: these props decide which axes may announce, so turning one
// on has to re-measure — otherwise the axis stays silent until some unrelated content change.
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

/**
 * Which edges the region touches, emitted as arrivals at each one.
 *
 * Deliberately not tied to the scroll event: content that fits the viewport produces no scroll at
 * all, so an edge that is reached from the very first render would otherwise never be reported.
 *
 * It reports arrivals and nothing more. Whether a list that still fits should ask for another page
 * is the caller's decision — this component cannot tell content that arrived from content the
 * caller drew in response to the last announcement, and guessing produced both a stalling pager
 * and a self-retriggering one.
 */
function updateEdges(target: HTMLElement): Omit<VcScrollbarPayloadType, "scrollTop" | "scrollLeft"> {
  const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = target;
  const threshold = props.edgeThreshold;

  const measured = {
    isAtTop: scrollTop <= threshold,
    isAtBottom: scrollTop + clientHeight >= scrollHeight - threshold,
    isAtLeft: scrollLeft <= threshold,
    isAtRight: scrollLeft + clientWidth >= scrollWidth - threshold,
  };

  // A collapsed axis measures 0 and therefore scores as sitting at BOTH of its edges — a popover's
  // content while closed (VcPopover renders it eagerly and hides it with display:none), a
  // `max-height: 0` region, a squeezed flex item. `||`, not `&&`: one collapsed axis is enough,
  // and the other axis's numbers are meaningless while the box has no area. Announce nothing and
  // leave the published state for the first real measurement rather than poisoning it with this one.
  if (!clientHeight || !clientWidth) {
    return measured;
  }

  measuredAt.value++;

  // An axis that cannot scroll sits at both of its edges by definition (`overflow: hidden` on the
  // disabled modifier, and `overflow-*-auto` only on the axis that is turned on), so announcing
  // them would report an arrival nobody can make.
  const verticalScrolls = props.vertical && !props.disabled;
  const horizontalScrolls = props.horizontal && !props.disabled;

  // The refs still hold the PREVIOUS measurement here — they are written at the end of this
  // function — which is what makes the four events below arrivals rather than states.
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

  // The state doubles as the latch, so it is written only for the axes that can emit: recording an
  // arrival on a gated axis would leave it already "arrived", and turning that axis on later
  // (VcTable binds both from props) would then announce nothing.
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

    // Snapshot before the handlers run: updateEdges calls the consumer's reach-* handlers
    // synchronously, and one of those may scroll the element, which would leave the payload
    // describing a position the flags were never computed from.
    const { scrollTop, scrollLeft } = target;

    // `scroll` reports the position, so it carries the flags rather than the transitions, and only
    // an actual scroll emits it. The flags come back from updateEdges: computing them a second time
    // here would let the payload and the reach-* events drift apart on any threshold change.
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
