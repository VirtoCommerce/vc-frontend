<template>
  <div class="vc-popover">
    <div v-if="$slots.default" ref="reference" class="vc-popover__trigger">
      <slot :open="open" :close="close" :toggle="toggle" :opened="opened" :trigger-props="emitTriggerProps" />
    </div>

    <!-- Only event listeners are bound here: the slot may contain a real interactive element,
         and an interactive role on the wrapper would nest interactive controls (axe: nested-interactive).
         The slot exposes role-free aria trigger props for the consumer to bind on their own element. -->
    <div v-else-if="$slots.trigger" ref="reference" class="vc-popover__trigger" v-on="triggerListeners">
      <slot
        name="trigger"
        :open="open"
        :close="close"
        :toggle="toggle"
        :opened="opened"
        :trigger-props="ariaTriggerProps"
      />
    </div>

    <teleport :to="teleportSelector" :disabled="!shouldTeleport">
      <div
        v-if="$slots.content && !disabled && shouldRenderContent"
        :id="contentId"
        ref="floating"
        :style="{ zIndex, display, width, '--vc-popover-origin': transformOrigin, ...floatingStyles }"
        :class="[
          'vc-popover__body',
          {
            'vc-popover__body--shadow': shadow,
            'vc-popover__body--positioned': positioned,
          },
        ]"
        :role="role"
        :aria-label="ariaLabel"
        :tabindex="isDialog ? -1 : undefined"
      >
        <div
          v-if="arrowEnabled"
          ref="floatingArrow"
          class="vc-popover__popper"
          :style="{
            left: arrowLeft,
          }"
        >
          <div class="vc-popover__arrow"></div>
        </div>

        <div class="vc-popover__content">
          <slot name="content" :close="close" />
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { flip, offset, shift, size, useFloating, autoUpdate, arrow } from "@floating-ui/vue";
import { onClickOutside, useEventListener } from "@vueuse/core";
import { ref, toRefs, computed, watch, inject, nextTick } from "vue";
import { useComponentId } from "@/ui-kit/composables";
import { findFirstFocusableElement, getColorValue } from "@/ui-kit/utilities";
import { vcPopoverKey } from "./vc-popover-context";

interface IEmits {
  (event: "toggle", value: boolean): void;
}

interface IProps {
  placement?: VcPopoverPlacementType;
  strategy?: VcPopoverStrategyType;
  flipOptions?: VcPopoverFlipOptionsType;
  offsetOptions?: VcPopoverOffsetOptionsType;
  shiftOptions?: VcPopoverShiftOptionsType;
  /**
   * Prevents opening and closes an open popover. For `dialog` panels it also hands focus back to the
   * trigger once it clears, but only when disabling left focus on the document body.
   */
  disabled?: boolean;
  shadow?: boolean;
  bgColor?: string;
  radius?: string;
  width?: string;
  zIndex?: number | string;
  /**
   * ARIA role of the content panel, and the source of the trigger's `aria-haspopup`: a popup kind
   * (`menu`, `listbox`, `tree`, `grid`, `dialog`) is announced as itself, `tooltip` not at all, and
   * any other role — including none — keeps the historical `dialog`. `VcDropdownMenu` passes no role
   * on, so its panels are the known holdouts: their triggers announce a dialog over a list that is
   * role-less unless the consumer names it itself, as `VcSelect` does. Giving those panels a role
   * here is a separate change.
   *
   * `dialog` additionally enables the non-modal dialog keyboard contract (WAI-ARIA APG): Escape
   * closes the panel from anywhere in its DOM subtree — teleported content sits outside it and must
   * handle its own — the panel takes focus when it opens, unless `hover` is set or a consumer claims
   * focus from `@toggle`, and focus returns to the trigger on close. Pair it with `ariaLabel`:
   * a dialog needs a name.
   */
  role?: VcPopoverRoleType | (string & {});
  /**
   * Open on hover and focus instead of click. A hover panel never takes focus — it would close
   * itself on the trigger's `focusout` — so it cannot carry a dialog the keyboard needs to enter.
   */
  hover?: boolean;
  disableTriggerEvents?: boolean;
  arrowEnabled?: boolean;
  /** Accessible name of the content panel. Required when `role` is `dialog`. */
  ariaLabel?: string;
  enableTeleport?: boolean | null;
  teleportSelector?: string;
  lazy?: boolean;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  zIndex: 1,
  placement: "bottom",
  teleportSelector: "[id='popover-host']",
  enableTeleport: null,
});

// The values aria-haspopup accepts as a popup kind; `true` is a synonym for `menu`, not a neutral yes.
// A tooltip is the one role VcPopover knows that the attribute has no token for.
type HaspopupTokenType = Exclude<VcPopoverRoleType, "tooltip">;

// `satisfies Record<…>` so a role added to the union has to be answered here: a missing key is a
// compile error, not a panel silently announced as a dialog.
const HASPOPUP_TOKENS = { menu: true, listbox: true, tree: true, grid: true, dialog: true } satisfies Record<
  HaspopupTokenType,
  true
>;

function isHaspopupToken(value: string | undefined): value is HaspopupTokenType {
  return value !== undefined && Object.hasOwn(HASPOPUP_TOKENS, value);
}

const popoverContext = inject(vcPopoverKey, null);
const shouldTeleport = computed(() =>
  props.enableTeleport === null ? (popoverContext?.enableTeleport.value ?? false) : props.enableTeleport,
);

const opened = ref(false);
const hasBeenOpened = ref(false);
const reference = ref<HTMLElement | null>(null);
const floating = ref<HTMLElement | null>(null);
const triggerElement = ref<HTMLElement | null>(null);
const focusReturnPending = ref(false);
const floatingArrow = ref<Element | null>(null);
const contentId = useComponentId("vc-popover");
const { placement, strategy, flipOptions, offsetOptions, shiftOptions } = toRefs(props);

const shouldRenderContent = computed(() => !props.lazy || hasBeenOpened.value);
const isDialog = computed(() => props.role === "dialog");

const triggerListeners = computed(() => ({
  mouseenter: props.hover ? open : undefined,
  mouseleave: props.hover ? close : undefined,
  focusin: props.hover ? open : undefined,
  focusout: props.hover ? close : undefined,
  click: props.hover ? undefined : toggle,
  // Keydown, not keyup: a nested dialog's trigger sits inside the outer panel, which would close
  // first and move focus away before any keyup arrived.
  keydown: (e: KeyboardEvent) => {
    if (e.key !== "Escape" || !opened.value) {
      return;
    }

    // A hover panel opened itself under the passing focus, so it closes but does not claim the key.
    if (!props.hover) {
      e.stopPropagation();
    }

    close();
  },
}));

// Role-free aria state for the #trigger slot: bound by the consumer on their own
// (already interactive) element, so no role may be forced here.
// aria-haspopup announces what the panel IS — VCST-5869 was a trigger promising a dialog the panel
// never was. A role-less panel keeps the historical `dialog` rather than losing the announcement;
// the fix there is a real role on those panels.
const triggerHaspopup = computed<HaspopupTokenType | undefined>(() => {
  if (isHaspopupToken(props.role)) {
    return props.role;
  }

  return props.role === "tooltip" ? undefined : "dialog";
});

const ariaTriggerProps = computed(() => ({
  "aria-haspopup": triggerHaspopup.value,
  "aria-expanded": opened.value,
  "aria-controls": opened.value ? contentId : undefined,
}));

// For the scoped default-slot pattern: the consumer binds these to their own trigger element.
const emitTriggerProps = computed(() => ({
  role: "button" as const,
  ...ariaTriggerProps.value,
  onMouseenter: triggerListeners.value.mouseenter,
  onMouseleave: triggerListeners.value.mouseleave,
  onFocusin: triggerListeners.value.focusin,
  onFocusout: triggerListeners.value.focusout,
  onClick: triggerListeners.value.click,
  onKeydown: triggerListeners.value.keydown,
}));

const display = computed(() => (opened.value ? "block" : "none"));

// A closed panel is display:none, so Floating UI measures it as zero and the position it holds
// while closed is stale — measured on the header's preferences menu: left 1374px against the 955px
// it belongs at. Reopening paints that stale place for one frame before autoUpdate corrects it,
// which is the panel "sliding in from the right". isPositioned cannot gate this, because after the
// first open it is already true; so the panel stays transparent until a position has been written
// for THIS opening. Two frames: autoUpdate measures and writes on the first one.
const repositioned = ref(false);

watch(opened, (isOpen) => {
  repositioned.value = false;

  if (!isOpen || typeof requestAnimationFrame !== "function") {
    return;
  }

  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      repositioned.value = opened.value;
    }),
  );
});

const positioned = computed(() => opened.value && isPositioned.value && repositioned.value);

// Grow out of the trigger rather than out of nowhere: the origin is the edge that faces it.
const SIDE_ORIGINS: Record<string, string> = { top: "bottom", bottom: "top", left: "right", right: "left" };
const ALIGNMENT_ORIGINS: Record<string, string> = { start: "left", end: "right" };

const transformOrigin = computed(() => {
  const [side, alignment] = resolvedPlacement.value.split("-");
  const block = SIDE_ORIGINS[side] ?? "center";
  const inline = alignment ? (ALIGNMENT_ORIGINS[alignment] ?? "center") : "center";

  // transform-origin reads horizontal first, so a side placement puts its edge in front.
  return side === "left" || side === "right" ? `${block} center` : `${inline} ${block}`;
});
const arrowLeft = computed(() => (middlewareData.value.arrow?.x != null ? `${middlewareData.value.arrow.x}px` : ""));
const _bgColor = computed(() => getColorValue(props.bgColor));
const _radius = computed(() => props.radius);

const {
  floatingStyles,
  middlewareData,
  isPositioned,
  placement: resolvedPlacement,
} = useFloating(reference, floating, {
  placement,
  strategy,
  transform: false,
  middleware: [
    flip(flipOptions.value),
    offset(offsetOptions.value),
    shift(shiftOptions.value),
    // How much room the panel actually has, published for its content to clamp against. Nothing
    // else can work it out: the height left below a trigger depends on where flip and shift put
    // the panel, which only Floating UI knows, so a panel guessing it with a `100vh - n` had to
    // hardcode an assumption about its own trigger and was wrong the moment the header grew.
    // Written as a property rather than applied here, because what should scroll is the
    // consumer's decision — the whole panel, or a column inside it.
    size({
      padding: 8,
      apply({ availableHeight, elements }) {
        elements.floating.style.setProperty("--vc-popover-available-height", `${Math.floor(availableHeight)}px`);
      },
    }),
    arrow({ element: floatingArrow }),
  ],
  whileElementsMounted(...args) {
    return autoUpdate(...args, { animationFrame: true });
  },
});

function open() {
  if (props.disabled) {
    return;
  }

  hasBeenOpened.value = true;
  opened.value = true;
}

function close() {
  if (props.disabled) {
    return;
  }

  opened.value = false;
}

function toggle() {
  if (props.disabled) {
    return;
  }

  if (!opened.value) {
    hasBeenOpened.value = true;
  }

  opened.value = !opened.value;
}

function firstFocusableInTrigger(): HTMLElement | null {
  return reference.value ? findFirstFocusableElement(reference.value, {}) : null;
}

function captureTriggerElement(): void {
  const active = document.activeElement;

  if (reference.value && active instanceof HTMLElement && reference.value.contains(active)) {
    triggerElement.value = active;
    return;
  }

  triggerElement.value = firstFocusableInTrigger();
}

function focusTrigger(): void {
  // The captured element can be gone by now — a consumer re-rendering its trigger replaces the node.
  const target = triggerElement.value?.isConnected ? triggerElement.value : firstFocusableInTrigger();

  target?.focus();
  focusReturnPending.value = document.activeElement !== target;
}

async function focusPanel(): Promise<void> {
  // A hover popover closes on its trigger's focusout, so taking focus would close it and reopen it.
  if (props.hover) {
    return;
  }

  await nextTick();

  // Skipped when a consumer claimed focus from its own @toggle handler (VcDatePicker: the active day).
  if (!floating.value || floating.value.contains(document.activeElement)) {
    return;
  }

  floating.value.focus();
}

async function returnFocusToTrigger(): Promise<void> {
  // Read before the panel is hidden: a click outside leaves focus elsewhere and must not be stolen.
  const focusWasInside = floating.value?.contains(document.activeElement) ?? false;

  if (!focusWasInside) {
    return;
  }

  await nextTick();
  focusTrigger();
}

// Disabling a focused trigger (a drawer reloading its list) drops focus to <body> and leaves nothing
// to return to, so the return is retried once the trigger can take focus again.
watch(
  () => props.disabled,
  async (disabled) => {
    if (disabled) {
      // Pre-flush, while focus still sits where it is about to be lost.
      focusReturnPending.value ||= reference.value?.contains(document.activeElement) ?? false;

      // The panel is v-if'd out by `disabled` while `close()` refuses to run, which would otherwise
      // leave `aria-expanded="true"` behind and re-show the panel when the consumer re-enables it.
      opened.value = false;
      return;
    }

    // Dialog-only: a tooltip must not pull focus back just because it was disabled and re-enabled.
    if (!isDialog.value || !focusReturnPending.value) {
      return;
    }

    focusReturnPending.value = false;

    // Only when the failed return left focus nowhere: anything else means the user has moved on.
    if (document.activeElement !== document.body) {
      return;
    }

    await nextTick();
    focusTrigger();
  },
);

// On the element, not in the template: a handler there trips vuejs-accessibility/no-static-element-interactions.
useEventListener(floating, "keydown", (event: KeyboardEvent) => {
  // `repeat`: a held key must not walk up the nesting, closing a level per repeat.
  if (!isDialog.value || event.key !== "Escape" || event.repeat) {
    return;
  }

  // Only the innermost dialog reacts, so nested popovers close one level at a time.
  event.stopPropagation();
  close();
});

// Reactivity loss is acceptable here: teleportSelector is static after mount,
// and onClickOutside options are not reactive anyway
// eslint-disable-next-line vue/no-setup-props-reactivity-loss
onClickOutside(reference, () => close(), { ignore: [floating, props.teleportSelector] });

watch(opened, (value: boolean) => {
  // Emitted first so a consumer's own focus handling queues ahead of focusPanel and wins the panel.
  emit("toggle", value);

  if (!isDialog.value) {
    return;
  }

  if (value) {
    // Bounded to one interaction: a return that failed for good has nothing left to hand back.
    focusReturnPending.value = false;
    captureTriggerElement();
    void focusPanel();
  } else {
    void returnFocusToTrigger();
  }
});
</script>

<style lang="scss">
.vc-popover {
  $popper: "";
  $shadow: "";
  $positioned: "";

  @apply max-w-full;

  &__trigger {
    @apply max-w-full size-full;
  }

  &__popper {
    $popper: &;

    @apply absolute top-0 w-5 h-2.5 p-1 overflow-hidden;
  }

  &__body {
    // For teleportation cases, variables are declared in &__body
    --props-bg-color: v-bind(_bgColor);
    --props-radius: v-bind(_radius);
    --bg-color: var(--props-bg-color, var(--vc-popover-bg-color, transparent));
    --radius: var(--props-radius, var(--vc-popover-radius, var(--vc-radius, 0.5rem)));
    --arrow-color: var(--props-bg-color, var(--vc-popover-bg-color, var(--color-additional-50)));

    // Radius only shapes the focus ring a dialog panel gets when it takes focus: the body itself
    // paints nothing, the card is drawn by &__content.
    @apply max-w-[100vw] rounded-[--radius];

    &:has(#{$popper}) {
      @apply pt-2.5;
    }

    &--shadow {
      $shadow: &;
    }

    &--positioned {
      $positioned: &;
    }
  }

  &__arrow {
    @apply w-3 h-3 rotate-45 bg-[--arrow-color];

    #{$shadow} & {
      @apply shadow-md;
    }
  }

  &__content {
    // Held back until Floating UI has a position — see `positioned` in the script — and then it
    // grows out of the edge facing the trigger instead of being switched on in place. The panel
    // itself carries the offsets, so the transform here is free to be used for motion.
    // The origin arrives as an inline custom property on the body: v-bind() would land on the
    // component's root, which a teleported panel is not.
    @apply rounded-[--radius] bg-[--bg-color] opacity-0;

    --duration: var(--vc-popover-enter-duration, 0.14s);

    transform: translateY(-0.25rem) scale(0.97);
    transform-origin: var(--vc-popover-origin, center top);
    transition:
      opacity var(--duration) ease,
      transform var(--duration) cubic-bezier(0.2, 0.8, 0.2, 1);

    #{$positioned} & {
      @apply opacity-100;

      transform: none;
    }

    #{$shadow} & {
      @apply shadow-lg;
    }

    // The distance is what the motion is for; without it the panel just fades.
    @media (prefers-reduced-motion: reduce) {
      transform: none;
      transition: opacity var(--duration) ease;
    }
  }
}
</style>
