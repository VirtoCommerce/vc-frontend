<template>
  <VcPopover
    :class="[
      'vc-dropdown-menu',
      {
        'vc-dropdown-menu--disabled': disabled,
      },
    ]"
    :placement="placement"
    :offset-options="offsetOptions"
    :z-index="zIndex"
    :disabled="disabled"
    :disable-trigger-events="disableTriggerEvents"
    @toggle="$emit('toggle', $event)"
  >
    <template #trigger="{ toggle, open, close, opened }">
      <div class="vc-dropdown-menu__trigger">
        <slot name="trigger" v-bind="{ toggle, open, close, opened }" />
      </div>
    </template>

    <template v-if="!disabled" #content="{ close }">
      <ul class="vc-dropdown-menu__list" :style="{ maxHeight, width }">
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
  placement?: VcDropdownMenuPlacementType;
  maxHeight?: string;
  offsetOptions?: VcDropdownMenuOffsetOptionsType;
  hover?: boolean;
  disabled?: boolean;
  width?: string;
  zIndex?: number | string;
  disableTriggerEvents?: boolean;
}

defineEmits<IEmits>();

withDefaults(defineProps<IProps>(), {
  placement: "bottom-start",
  maxHeight: "12rem",
  offsetOptions: 4,
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
