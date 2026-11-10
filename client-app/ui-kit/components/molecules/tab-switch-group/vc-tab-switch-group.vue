<template>
  <div ref="root" class="vc-tab-switch-group" role="radiogroup" tabindex="-1" @keydown="onKeydown">
    <span
      v-if="pillRect"
      ref="pill"
      class="vc-tab-switch-group__pill"
      :style="pillStyle"
      aria-hidden="true"
      data-test-id="vc-tab-switch-group-pill"
    />

    <slot />
  </div>
</template>

<script setup lang="ts">
import { usePreferredReducedMotion, useResizeObserver } from "@vueuse/core";
import { computed, onMounted, provide, ref, shallowReactive, useTemplateRef, watch } from "vue";
import { useComponentId } from "@/ui-kit/composables";
import { vcTabSwitchGroupKey } from "./vc-tab-switch-group-context";

interface IEmits {
  (event: "change", value: VcTabSwitchGroupValueType): void;
}

const emit = defineEmits<IEmits>();

defineSlots<{
  /** `VcTabSwitch` items. Name the group with `aria-label` or `aria-labelledby`. */
  default?: () => unknown;
}>();

const model = defineModel<VcTabSwitchGroupValueType>();

const ARROW_STEPS = new Map([
  ["ArrowDown", 1],
  ["ArrowRight", 1],
  ["ArrowUp", -1],
  ["ArrowLeft", -1],
]);
const PILL_DURATION_MS = 520;
const PILL_EASING = "cubic-bezier(0.34, 0.86, 0.22, 1)";
// The share of the move at which the pill spans both items before it settles on the new one.
const PILL_STRETCH_OFFSET = 0.42;

const reducedMotion = usePreferredReducedMotion();

const root = useTemplateRef<HTMLElement>("root");
const pill = useTemplateRef<HTMLElement>("pill");
const pillRect = ref<{ left: number; top: number; width: number; height: number } | null>(null);
let pillAnimation: Animation | undefined;

const name = useComponentId("tab-switch-group");
const registeredItems = shallowReactive(new Set<VcTabSwitchGroupItemType>());

function select(value: VcTabSwitchGroupValueType): void {
  model.value = value;
  emit("change", value);
}

function register(item: VcTabSwitchGroupItemType): () => void {
  registeredItems.add(item);

  return () => {
    registeredItems.delete(item);
  };
}

// A checked item that is disabled is no tab stop, so it does not count either.
const hasCheckedItem = computed(() =>
  Array.from(registeredItems).some((item) => !item.disabled() && item.value() === model.value),
);

const pillStyle = computed(() => {
  const rect = pillRect.value;

  return rect && { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` };
});

// The pill is hidden in classic; a design that shows it (soft) gets the checked look sliding between the items.
function placePill(animate: boolean): void {
  const checkedEl = root.value?.querySelector<HTMLElement>('[role="radio"][aria-checked="true"]');
  const from = pillRect.value;
  const to = checkedEl
    ? {
        left: checkedEl.offsetLeft,
        top: checkedEl.offsetTop,
        width: checkedEl.offsetWidth,
        height: checkedEl.offsetHeight,
      }
    : null;

  pillRect.value = to;
  pillAnimation?.cancel();

  const isMoved = !!from && !!to && (from.left !== to.left || from.width !== to.width);

  if (!animate || !isMoved || reducedMotion.value === "reduce" || !pill.value) {
    return;
  }

  // left/width rather than a transform: scaling would squash the rounded ends and the shadow of the stretched pill.
  const start = Math.min(from.left, to.left);
  const end = Math.max(from.left + from.width, to.left + to.width);

  pillAnimation = pill.value.animate(
    [
      { left: `${from.left}px`, width: `${from.width}px` },
      { left: `${start}px`, width: `${end - start}px`, offset: PILL_STRETCH_OFFSET },
      { left: `${to.left}px`, width: `${to.width}px` },
    ],
    { duration: PILL_DURATION_MS, easing: PILL_EASING },
  );
}

// Radio group keys: arrows move and select (wrapping), Home and End go to the ends; disabled items are skipped.
function onKeydown(event: KeyboardEvent): void {
  const el = root.value;

  // Leave modified arrows to the browser: Alt+Left goes back in history.
  if (!el || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
    return;
  }

  const items = Array.from(el.querySelectorAll<HTMLElement>('[role="radio"]:not([aria-disabled="true"])'));
  const index = items.indexOf(event.target as HTMLElement);

  if (index === -1) {
    return;
  }

  const isHorizontal = event.key === "ArrowLeft" || event.key === "ArrowRight";
  // In RTL the horizontal arrows swap: the right one points to the previous item.
  const direction = isHorizontal && getComputedStyle(el).direction === "rtl" ? -1 : 1;
  const step = (ARROW_STEPS.get(event.key) ?? 0) * direction;

  let target: HTMLElement | undefined;

  if (step) {
    target = items[(index + step + items.length) % items.length];
  } else if (event.key === "Home") {
    target = items[0];
  } else if (event.key === "End") {
    target = items.at(-1);
  }

  if (!target) {
    return;
  }

  event.preventDefault();
  target.focus();
  target.click();
}

watch(model, () => placePill(true), { flush: "post" });

useResizeObserver(root, () => placePill(false));

onMounted(() => placePill(false));

provide(vcTabSwitchGroupKey, {
  modelValue: model,
  hasCheckedItem,
  name,
  select,
  register,
});
</script>

<style lang="scss">
.vc-tab-switch-group {
  --gap: var(--vc-tab-switch-group-gap, theme("spacing.1"));
  --padding: var(--vc-tab-switch-group-padding, 0px);
  --radius: var(--vc-tab-switch-group-radius, var(--vc-radius, 0.5rem));
  --bg-color: var(--vc-tab-switch-group-bg-color, transparent);

  // isolate: the pill sits under the items but above the track.
  @apply relative isolate inline-flex max-w-full gap-[--gap] p-[--padding] rounded-[--radius] bg-[--bg-color];

  &__pill {
    @apply absolute -z-10 hidden pointer-events-none;
  }
}
</style>
