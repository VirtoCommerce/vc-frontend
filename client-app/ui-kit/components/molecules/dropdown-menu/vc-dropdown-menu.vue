<template>
  <VcPopover
    :class="[
      'vc-dropdown-menu',
      {
        'vc-dropdown-menu--disabled': disabled,
        'vc-dropdown-menu--dividers': dividers,
      },
    ]"
    :width="computedWidth"
    :placement="placement"
    :offset-options="offsetOptions"
    :z-index="zIndex"
    :disabled="disabled"
    enable-teleport
    @toggle="$emit('toggle', $event)"
  >
    <template #default="{ toggle, open, close, opened, triggerProps }">
      <div ref="trigger" class="vc-dropdown-menu__trigger">
        <slot name="trigger" v-bind="{ toggle, open, close, opened, triggerProps }" />
      </div>
    </template>

    <template v-if="!disabled" #content="{ close }">
      <VcScrollbar vertical tag="ul" class="vc-dropdown-menu__list">
        <slot name="content" v-bind="{ close }" />
      </VcScrollbar>
    </template>
  </VcPopover>
</template>

<script setup lang="ts">
import { useElementBounding } from "@vueuse/core";
import { useTemplateRef, computed } from "vue";

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
  dividers?: boolean;
}

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  placement: "bottom-start",
  offsetOptions: 4,
  dividers: true,
  zIndex: 10,
});

const trugger = useTemplateRef("trigger");
const computedWidth = computed(() => props.width || `${useElementBounding(trugger).width.value}px`);
</script>

<style lang="scss">
.vc-dropdown-menu {
  $disabled: "";
  $dividers: "";

  --props-max-height: v-bind(props.maxHeight);
  --max-height: var(--vc-dropdown-menu-max-height, var(--props-max-height, 12rem));
  --radius: var(--vc-dropdown-menu-radius, var(--vc-radius, 0.5rem));

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

    #{$disabled} & > * {
      @apply cursor-not-allowed;
    }
  }

  &__list {
    @apply max-h-[--max-height] w-full rounded-[--radius] bg-additional-50 shadow-xl;

    #{$dividers} & {
      @apply divide-y divide-neutral-100;
    }

    & > *:first-child {
      @apply rounded-t-[--radius];
    }

    & > *:last-child {
      @apply rounded-b-[--radius];
    }
  }
}
</style>
