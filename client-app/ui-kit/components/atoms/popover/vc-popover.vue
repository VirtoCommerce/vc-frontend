<template>
  <div class="vc-popover">
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
      @blur="hover && close()"
      @click="!hover && toggle()"
      @keyup="!hover && toggle()"
    >
      <slot name="trigger" :open="open" :close="close" :toggle="toggle" :opened="opened" />
    </div>

    <div ref="floating" :style="{ zIndex, display, ...floatingStyles }" class="vc-popover__content" :role="role">
      <slot name="content" :close="close" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { flip, offset, shift, useFloating, autoUpdate } from "@floating-ui/vue";
import { onClickOutside } from "@vueuse/core";
import { ref, toRefs, computed, watch } from "vue";
import type { Placement, Strategy, OffsetOptions, FlipOptions, ShiftOptions } from "@floating-ui/vue";

interface IEmits {
  (event: "toggle", value: boolean): void;
}

interface IProps {
  placement?: Placement;
  strategy?: Strategy;
  flipOptions?: FlipOptions;
  offsetOptions?: OffsetOptions;
  shiftOptions?: ShiftOptions;
  disabled?: boolean;
  zIndex?: number | string;
  role?: string;
  hover?: boolean;
  disableTriggerEvents?: boolean;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  zIndex: 1,
  placement: "bottom",
});

const opened = ref(false);
const reference = ref<HTMLElement | null>(null);
const floating = ref<HTMLElement | null>(null);
const { placement, strategy, flipOptions, offsetOptions, shiftOptions } = toRefs(props);

const display = computed(() => (opened.value ? "block" : ""));

const { floatingStyles } = useFloating(reference, floating, {
  placement,
  strategy,
  middleware: [flip(flipOptions.value), offset(offsetOptions.value), shift(shiftOptions.value)],
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
  &__content {
    @apply hidden absolute top-0 left-0;
  }
}
</style>
