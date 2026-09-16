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
        :style="{ zIndex, display, width, ...floatingStyles }"
        :class="[
          'vc-popover__body',
          {
            'vc-popover__body--shadow': shadow,
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
import { flip, offset, shift, useFloating, autoUpdate, arrow } from "@floating-ui/vue";
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
   * any other role — including none — keeps the historical `dialog`. Panels rendered through
   * `VcDropdownMenu` declare their role on their own list, so their triggers are still announced as
   * dialogs; giving those panels a role is a separate change.
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
const HASPOPUP_TOKENS = ["menu", "listbox", "tree", "grid", "dialog"] as const;

type HaspopupTokenType = (typeof HASPOPUP_TOKENS)[number];

function isHaspopupToken(value: string | undefined): value is HaspopupTokenType {
  return HASPOPUP_TOKENS.includes(value as HaspopupTokenType);
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
  // Escape only, and on keydown: a nested dialog's trigger sits inside the outer panel, whose own
  // keydown listener would otherwise close the outer one first and move focus away before the keyup
  // ever arrived. No Enter branch: native buttons/links already activate via `click` on keydown.
  keydown: (e: KeyboardEvent) => {
    if (e.key !== "Escape" || !opened.value) {
      return;
    }

    e.stopPropagation();
    close();
  },
}));

// Role-free aria state for the #trigger slot: bound by the consumer on their own
// (already interactive) element, so no role may be forced here.
// aria-haspopup announces what the panel IS, so it follows `role` where the panel declares one —
// VCST-5869 was exactly a trigger promising a dialog the panel never was. `tooltip` has no token at
// all and a tooltip must not claim a popup. A panel with no role keeps the historical default rather
// than losing the announcement: the honest fix there is to give those panels a role, not to silence
// their triggers.
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
const arrowLeft = computed(() => (middlewareData.value.arrow?.x != null ? `${middlewareData.value.arrow.x}px` : ""));
const _bgColor = computed(() => getColorValue(props.bgColor));
const _radius = computed(() => props.radius);

const { floatingStyles, middlewareData } = useFloating(reference, floating, {
  placement,
  strategy,
  transform: false,
  middleware: [
    flip(flipOptions.value),
    offset(offsetOptions.value),
    shift(shiftOptions.value),
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
  // A hover popover closes on focusout of its trigger, so pulling focus into the panel would make it
  // close itself and reopen on the way back.
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

// A consumer that disables its trigger while closing (a filter drawer reloading its list) leaves
// nothing focusable to return to — and disabling a focused button drops focus to <body> — so the
// return is retried once the trigger can take focus again.
watch(
  () => props.disabled,
  async (disabled) => {
    if (disabled) {
      // Pre-flush, so focus still sits where it will be lost: disabling a focused trigger drops
      // focus to <body>, which a return that already landed would otherwise not know about.
      focusReturnPending.value ||= reference.value?.contains(document.activeElement) ?? false;

      // The panel is v-if'd out by `disabled` while `close()` refuses to run, which would otherwise
      // leave `aria-expanded="true"` behind and re-show the panel when the consumer re-enables it.
      opened.value = false;
      return;
    }

    // Dialog-only, like the rest of the focus contract: a tooltip or dropdown must not pull focus
    // back just because it was disabled and re-enabled.
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

// Bound on the element rather than in the template: a keydown handler there would make the panel
// an interactive static element (vuejs-accessibility/no-static-element-interactions).
useEventListener(floating, "keydown", (event: KeyboardEvent) => {
  // `repeat`: one held key must not walk up the nesting, closing a level per repeat as focus is
  // handed outwards — a drawer would lose everything typed into it.
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
  }

  &__arrow {
    @apply w-3 h-3 rotate-45 bg-[--arrow-color];

    #{$shadow} & {
      @apply shadow-md;
    }
  }

  &__content {
    @apply bg-[--bg-color] rounded-[--radius];

    #{$shadow} & {
      @apply shadow-lg;
    }
  }
}
</style>
