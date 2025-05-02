<template>
  <div class="option-predefined-text">
    <VcRadioButton :model-value="modelValue" :name="name" :value="text" @input="$emit('input')">
      <span class="option-predefined-text__label">
        {{ text }}
      </span>
    </VcRadioButton>
  </div>
</template>

<script setup lang="ts">
defineEmits<IEmits>();
defineProps<IProps>();

interface IProps {
  text: string;
  modelValue?: string;
  name: string;
}

interface IEmits {
  (e: "input"): void;
}
</script>

<style lang="scss">
.option-predefined-text {
  @apply p-4 odd:bg-neutral-50;

  &__label {
    @apply ms-2 text-sm font-bold;
  }
}
</style>
