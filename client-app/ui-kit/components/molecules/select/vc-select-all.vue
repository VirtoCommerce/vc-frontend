<template>
  <div class="vc-select-all">
    <VcCheckbox
      ref="checkboxComponent"
      size="sm"
      class="vc-select-all__control"
      :model-value="checked"
      :indeterminate="indeterminate"
      :aria-label="accessibleLabel"
      prevent-default
      @change="$emit('change')"
    >
      <span class="vc-select-all__text">{{ $t("ui_kit.select.select_all") }}</span>
    </VcCheckbox>

    <span class="vc-select-all__count">{{ count }}</span>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue";

defineEmits<{
  (event: "change"): void;
}>();

defineProps<{
  checked: boolean;
  indeterminate: boolean;
  /** Full label with the counts; the visible text is shorter. */
  accessibleLabel: string;
  /** Visible `n of m` counter. */
  count: string;
}>();

const checkboxComponent = useTemplateRef<{ $el: HTMLElement }>("checkboxComponent");

defineExpose({
  // The checkbox is outside the listbox and possibly teleported, so Tab hands focus over explicitly.
  focus(): boolean {
    const input = checkboxComponent.value?.$el?.querySelector<HTMLElement>("input");

    if (!input) {
      return false;
    }

    input.focus();
    return true;
  },
});
</script>

<style lang="scss">
.vc-select-all {
  @apply flex shrink-0 items-center gap-3 border-b border-neutral-100 px-3 py-2.5;

  &__control {
    @apply grow;
  }

  &__text {
    @apply text-sm font-bold text-neutral-950;
  }

  &__count {
    @apply shrink-0 text-sm text-neutral-600;
  }
}
</style>
