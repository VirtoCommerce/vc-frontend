<template>
  <VcPopover
    :class="[
      'vc-dropdown-menu',
      {
        'vc-dropdown-menu--disabled': disabled,
      },
    ]"
    :width="computedWidth"
    :placement="placement"
    :offset-options="offsetOptions"
    :z-index="zIndex"
    :disabled="disabled"
    :lazy="lazy"
    shadow
    @toggle="$emit('toggle', $event)"
  >
    <template #default="{ toggle, open, close, opened, triggerProps }">
      <div ref="trigger" class="vc-dropdown-menu__trigger">
        <slot name="trigger" v-bind="{ toggle, open, close, opened, triggerProps }" />
      </div>
    </template>

    <template v-if="!disabled" #content="{ close }">
      <VcScrollbar
        vertical
        tag="ul"
        :id="listId"
        :role="listRole"
        :aria-label="listLabel"
        :class="[
          'vc-dropdown-menu__list',
          {
            'vc-dropdown-menu__list--dividers': dividers,
          },
        ]"
        :style="{ '--props-max-height': maxHeight }"
      >
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
  listRole?: string;
  listId?: string;
  listLabel?: string;
  /** Defer rendering menu content until the menu is first opened (forwarded to VcPopover). */
  lazy?: boolean;
}

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  placement: "bottom-start",
  offsetOptions: 4,
  dividers: true,
  zIndex: 10,
});

const trigger = useTemplateRef("trigger");
const { width: triggerWidth } = useElementBounding(trigger);

const computedWidth = computed(() => {
  if (props.width === "trigger") {
    return `${triggerWidth.value}px`;
  }
  return props.width ?? "auto";
});
</script>

<style lang="scss">
.vc-dropdown-menu {
  $disabled: "";
  $dividers: "";

  @apply select-none;

  &--disabled {
    $disabled: &;
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

  .vc-popover__body:has(&__list) {
    --vc-popover-radius: var(--vc-dropdown-menu-radius, var(--vc-radius, 0.5rem));
    --vc-popover-bg-color: var(--vc-dropdown-menu-bg-color, var(--color-additional-50));
  }

  &__list {
    --max-height: var(--props-max-height, var(--vc-dropdown-menu-max-height, 12rem));

    @apply max-h-[--max-height] w-full rounded-[inherit];

    &--dividers {
      @apply divide-y divide-neutral-100;
    }

    & > *:first-child {
      @apply rounded-t-[--vc-popover-radius];
    }

    & > *:last-child {
      @apply rounded-b-[--vc-popover-radius];
    }
  }
}
</style>
