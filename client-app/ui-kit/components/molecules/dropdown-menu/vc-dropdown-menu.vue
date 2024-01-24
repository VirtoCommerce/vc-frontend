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
    :z-index="zIndex"
    :width="width"
    :trigger="trigger"
    :disabled="disabled"
    @toggle="$emit('toggle', $event)"
  >
    <template #trigger="{ open, close, opened }">
      <div class="vc-dropdown-menu__trigger">
        <slot name="trigger" v-bind="{ open, close, opened }" />
      </div>
    </template>

    <template v-if="!disabled" #content="{ close }">
      <ul class="vc-dropdown-menu__list" :style="{ maxHeight }">
        <slot name="content" v-bind="{ close }" />
      </ul>
    </template>
  </VcPopover>
</template>

<script setup lang="ts">
interface IEmits {
  (event: "toggle", value: boolean): void;
}

interface IProps {
  placement?: VcDropdownMenuPlacement;
  maxHeight?: string;
  xOffset?: number | string;
  yOffset?: number | string;
  trigger?: "hover" | "click";
  disabled?: boolean;
  width?: string;
  zIndex?: number | string;
}

defineEmits<IEmits>();

withDefaults(defineProps<IProps>(), {
  placement: "bottom-start",
  maxHeight: "12rem",
  yOffset: "4",
  trigger: "click",
  width: "auto",
  zIndex: 1,
});
</script>

<style lang="scss">
.vc-dropdown-menu {
  $disabled: "";

  @apply relative select-none;

  &--disabled {
    $disabled: &;
  }

  & > [role="button"] {
    @apply flex items-center h-full;
  }

  &__trigger {
    @apply flex h-full w-full items-center cursor-pointer;

    #{$disabled} & {
      @apply cursor-not-allowed;
    }
  }

  &__list {
    @apply overflow-y-auto w-full rounded bg-[--color-additional-50] shadow-xl divide-y divide-[--color-neutral-100];

    & > *:first-child {
      @apply rounded-t;
    }

    & > *:last-child {
      @apply rounded-b;
    }
  }
}
</style>
