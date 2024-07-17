<template>
  <div
    :class="[
      'vc-popover',
      {
        'vc-popover--arrow': arrowEnabled && arrowLeft,
      },
    ]"
  >
    <div v-if="disableTriggerEvents" ref="reference" class="vc-popover__trigger">
      <slot name="trigger" :open="open" :close="close" :toggle="toggle" :opened="opened" />
    </div>

    <div
      v-else
      ref="reference"
      class="vc-popover__trigger"
      role="button"
      tabindex="-1"
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

    <div ref="floating" :style="{ zIndex, display, width, ...floatingStyles }" class="vc-popover__content" :role="role">
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
  </div>
</template>

<script setup lang="ts">
import { flip, offset, shift, useFloating, autoUpdate, arrow } from "@floating-ui/vue";
import { onClickOutside } from "@vueuse/core";
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
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  zIndex: 1,
  placement: "bottom",
  width: "auto",
});

const opened = ref(false);
const reference = ref<HTMLElement | null>(null);
const floating = ref<HTMLElement | null>(null);
const floatingArrow = ref<Element | null>(null);
const { placement, strategy, flipOptions, offsetOptions, shiftOptions } = toRefs(props);

const display = computed(() => (opened.value ? "block" : ""));
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

onClickOutside(
  reference,
  () => {
    close();
  },
  { ignore: [floating] },
);

watch(opened, (value: boolean) => emit("toggle", value));
</script>

<style lang="scss">
.vc-popover {
  $arrow: "";

  &--arrow {
    $arrow: &;
  }

  &__popper {
    @apply absolute top-0 w-5 h-2.5 p-1 overflow-hidden;
  }

  &__arrow {
    @apply w-3 h-3 bg-additional-50 rotate-45 shadow-md;
  }

  &__content {
    @apply hidden absolute top-0 left-0;

    #{$arrow} & {
      @apply pt-2.5;
    }
  }
}
</style>
