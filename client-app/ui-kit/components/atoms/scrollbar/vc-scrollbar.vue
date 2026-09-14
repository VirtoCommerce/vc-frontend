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

const wasAtTop = ref(true);
const wasAtBottom = ref(false);
const wasAtLeft = ref(true);
const wasAtRight = ref(false);

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

  const edges = {
    isAtTop: scrollTop <= threshold,
    isAtBottom: scrollTop + clientHeight >= scrollHeight - threshold,
    isAtLeft: scrollLeft <= threshold,
    isAtRight: scrollLeft + clientWidth >= scrollWidth - threshold,
  };

  // A collapsed axis measures 0 and therefore scores as sitting at BOTH of its edges — a popover's
  // content while closed (VcPopover renders it eagerly and hides it with display:none), a
  // `max-height: 0` region, a squeezed flex item. `||`, not `&&`: one collapsed axis is enough,
  // and the other axis's numbers are meaningless while the box has no area. Announce nothing and
  // leave the latches for the first real measurement rather than poisoning them with this one.
  if (!clientHeight || !clientWidth) {
    return edges;
  }

  // An axis that cannot scroll sits at both of its edges by definition (`overflow: hidden` on the
  // disabled modifier, and `overflow-*-auto` only on the axis that is turned on), so announcing
  // them would report an arrival nobody can make.
  const verticalScrolls = props.vertical && !props.disabled;
  const horizontalScrolls = props.horizontal && !props.disabled;

  if (verticalScrolls && edges.isAtTop && !wasAtTop.value) {
    emit("reachTop");
  }
  if (verticalScrolls && edges.isAtBottom && !wasAtBottom.value) {
    emit("reachBottom");
  }
  if (horizontalScrolls && edges.isAtLeft && !wasAtLeft.value) {
    emit("reachLeft");
  }
  if (horizontalScrolls && edges.isAtRight && !wasAtRight.value) {
    emit("reachRight");
  }

  // Only for the axes that can emit: latching a gated axis would leave it already "arrived", so
  // turning that axis on later (VcTable binds both from props) would announce nothing.
  if (verticalScrolls) {
    wasAtTop.value = edges.isAtTop;
    wasAtBottom.value = edges.isAtBottom;
  }

  if (horizontalScrolls) {
    wasAtLeft.value = edges.isAtLeft;
    wasAtRight.value = edges.isAtRight;
  }

  return edges;
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
