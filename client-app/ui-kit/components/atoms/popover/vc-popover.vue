<template>
  <div ref="containerReference" class="vc-popover">
    <div v-if="disableTriggerEvents" ref="reference" class="vc-popover__trigger">
      <slot name="trigger" :open="open" :close="close" :toggle="toggle" :opened="opened" />
    </div>

    <div
      v-else
      ref="reference"
      class="vc-popover__trigger"
      role="button"
      tabindex="-1"
      :aria-label="ariaLabel"
      :aria-expanded="opened"
      @mouseenter="hover && open()"
      @mouseleave="hover && close()"
      @focusin="hover && open()"
      @focusout="hover && close()"
      @blur="hover && close()"
      @click="!hover && toggle()"
      @keyup.enter="!hover && open()"
      @keyup.esc="!hover && close()"
    >
      <slot name="trigger" :open="open" :close="close" :toggle="toggle" :opened="opened" />
    </div>

    <teleport :to="teleportSelector" :disabled="!enableTeleport">
      <div
        v-if="$slots.content && !disabled"
        ref="floating"
        :style="{ zIndex, display, width, ...floatingStyles }"
        class="vc-popover__content"
        :role="role"
        @mousedown.prevent
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

        <slot name="content" :close="close" />
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { flip, offset, shift, useFloating, autoUpdate, arrow } from "@floating-ui/vue";
import { onClickOutside, useFocusWithin } from "@vueuse/core";
import { ref, toRefs, computed, watch } from "vue";

interface IEmits {
  (event: "toggle", value: boolean): void;
}

interface IProps {
  placement?: VcPopoverPlacementType;
  strategy?: VcPopoverStrategyType;
  flipOptions?: VcPopoverFlipOptionsType;
  offsetOptions?: VcPopoverOffsetOptionsType;
  shiftOptions?: VcPopoverShiftOptionsType;
  disabled?: boolean;
  width?: string;
  zIndex?: number | string;
  role?: string;
  hover?: boolean;
  disableTriggerEvents?: boolean;
  arrowEnabled?: boolean;
  closeOnBlur?: boolean;
  ariaLabel?: string;
  enableTeleport?: boolean;
  teleportSelector?: string;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  zIndex: 1,
  placement: "bottom",
  width: "auto",
  enableTeleport: false,
  teleportSelector: "[id='popover-host']",
});

const opened = ref(false);
const reference = ref<HTMLElement | null>(null);
const containerReference = ref<HTMLElement | null>(null);
const floating = ref<HTMLElement | null>(null);
const floatingArrow = ref<Element | null>(null);
const { placement, strategy, flipOptions, offsetOptions, shiftOptions } = toRefs(props);

const display = computed(() => (opened.value ? "block" : "none"));
const arrowLeft = computed(() => (middlewareData.value.arrow?.x != null ? `${middlewareData.value.arrow.x}px` : ""));

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

  opened.value = !opened.value;
}

const { focused } = useFocusWithin(containerReference);

onClickOutside(
  reference,
  () => {
    close();
  },
  { ignore: [floating] },
);

watch(opened, (value: boolean) => emit("toggle", value));

watch(focused, (value: boolean) => {
  if (!value && props.closeOnBlur) {
    close();
  }
});
</script>

<style lang="scss">
.vc-popover {
  $popper: "";

  &__popper {
    $popper: &;

    @apply absolute top-0 w-5 h-2.5 p-1 overflow-hidden;
  }

  &__arrow {
    @apply w-3 h-3 bg-additional-50 rotate-45 shadow-md;
  }

  &__content {
    @apply max-w-[100vw];

    &:has(#{$popper}) {
      @apply pt-2.5;
    }
  }
}
</style>
