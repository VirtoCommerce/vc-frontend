<template>
  <VcPopover
    :class="[
      'vc-dropdown-menu',
      {
        'vc-dropdown-menu--disabled': disabled,
        'vc-dropdown-menu--dividers': dividers,
      },
    ]"
    :width="width"
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
      <ul class="vc-dropdown-menu__list">
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
  dividers?: boolean;
}

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  placement: "bottom-start",
  maxHeight: "",
  offsetOptions: 4,
  width: "auto",
  dividers: true,
});
</script>

<style lang="scss">
.vc-dropdown-menu {
  $disabled: "";
  $dividers: "";

  --props-max-height: v-bind(props.maxHeight);
  --max-height: var(--vc-dropdown-menu-max-height, var(--props-max-height, 12rem));

  @apply select-none;

  &--disabled {
    $disabled: &;
  }

  &--dividers {
    $dividers: &;
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
    @apply overflow-y-auto max-h-[--max-height] w-full rounded bg-additional-50 shadow-2xl;

    #{$dividers} & {
      @apply divide-y divide-neutral-100;
    }

    & > *:first-child {
      @apply rounded-t;
    }

    & > *:last-child {
      @apply rounded-b;
    }
  }
}
</style>
