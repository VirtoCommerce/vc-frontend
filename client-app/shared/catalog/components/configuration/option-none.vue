<template>
  <div class="option-none">
    <VcRadioButton :name="name" :model-value="selected ? 'none' : ''" value="none" @input="$emit('input')">
      <span class="option-none__label">
        {{ $t("shared.catalog.product_details.product_configuration.none") }}
      </span>
    </VcRadioButton>
  </div>
</template>

<script setup lang="ts">
defineEmits<IEmits>();

defineProps<Props>();

interface Props {
  selected?: boolean;
  name: string;
}

interface IEmits {
  (e: "input"): void;
}
</script>

<style lang="scss">
.option-none {
  @apply flex flex-col gap-3 p-4 odd:bg-neutral-50;

  &__label {
    @apply ml-2 text-sm font-bold;
  }
}
</style>
