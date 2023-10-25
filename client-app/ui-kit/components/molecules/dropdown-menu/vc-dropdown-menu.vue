<template>
  <VcPopover
    :class="[
      'vc-dropdown-menu',
      {
        'vc-dropdown-menu--disabled': disabled,
      },
    ]"
    :placement="placement"
    :x-offset="xOffset"
    :y-offset="yOffset"
    :trigger="trigger"
    :disabled="disabled"
    @toggle="$emit('toggle', $event)"
  >
    <template #trigger>
      <div class="vc-dropdown-menu__trigger">
        <slot name="trigger" />
      </div>
    </template>

    <template v-if="!disabled" #content>
      <ul class="vc-dropdown-menu__list" :style="{ maxHeight, width }">
        <slot name="content" />
      </ul>
    </template>
  </VcPopover>
</template>

<script setup lang="ts">
import type { Placement } from "@popperjs/core";

interface IEmits {
  (event: "toggle", value: boolean): void;
}

interface IProps {
  placement?: Placement;
  maxHeight?: string;
  xOffset?: number | string;
  yOffset?: number | string;
  trigger?: "hover" | "click";
  disabled?: boolean;
  width?: string;
}

defineEmits<IEmits>();

withDefaults(defineProps<IProps>(), {
  placement: "bottom-start",
  maxHeight: "12rem",
  yOffset: "4",
  trigger: "click",
  width: "auto",
});
</script>

<style lang="scss">
.vc-dropdown-menu {
  $disabled: "";

  @apply select-none;

  &--disabled {
    $disabled: &;
  }

  & > [role="button"] {
    @apply flex items-center h-full;
  }

  &__trigger {
    @apply flex h-full items-center cursor-pointer;

    #{$disabled} & {
      @apply cursor-not-allowed;
    }
  }

  &__list {
    @apply overflow-y-auto rounded bg-[--color-additional-50] shadow-xl;

    & > *:first-child {
      @apply rounded-t;
    }

    & > *:last-child {
      @apply rounded-b;
    }
  }
}
</style>
