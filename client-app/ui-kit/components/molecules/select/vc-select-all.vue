<template>
  <div :class="['vc-select-all', { 'vc-select-all--disabled': disabled }]">
    <VcCheckbox
      ref="checkboxComponent"
      size="sm"
      class="vc-select-all__control"
      :model-value="checked"
      :indeterminate="indeterminate"
      :disabled="disabled"
      :aria-label="accessibleLabel"
      prevent-default
      @change="$emit('change')"
    >
      <span class="vc-select-all__text">{{ $t("ui_kit.select.select_all") }}</span>
    </VcCheckbox>

    <!-- The label already reads the counts out. -->
    <span class="vc-select-all__count" aria-hidden="true">{{ count }}</span>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue";

interface IEmits {
  (event: "change"): void;
}

interface IProps {
  checked: boolean;
  indeterminate: boolean;
  /** Full label with the counts; the visible text is shorter. */
  accessibleLabel: string;
  /** Visible `n of m` counter. */
  count: string;
  /** Nothing to act on: no options, or the options on screen still answer an earlier query. */
  disabled?: boolean;
}

defineEmits<IEmits>();

const props = defineProps<IProps>();

const checkboxComponent = useTemplateRef<{ inputElement: HTMLInputElement | null }>("checkboxComponent");

defineExpose({
  // The checkbox is outside the listbox and possibly teleported, so Tab hands focus over explicitly.
  focus(): boolean {
    const input = checkboxComponent.value?.inputElement;

    if (!input || props.disabled) {
      return false;
    }

    input.focus();
    return true;
  },
});
</script>

<style lang="scss">
.vc-select-all {
  $disabled: "";

  @apply flex shrink-0 items-center gap-3 border-b border-neutral-100 px-3 py-2.5;

  &--disabled {
    $disabled: &;
  }

  &__control {
    @apply grow;
  }

  &__text {
    @apply text-sm font-bold text-neutral-950;

    #{$disabled} & {
      @apply text-neutral-400;
    }
  }

  &__count {
    @apply shrink-0 text-sm text-neutral-600;

    #{$disabled} & {
      @apply text-neutral-400;
    }
  }
}
</style>
