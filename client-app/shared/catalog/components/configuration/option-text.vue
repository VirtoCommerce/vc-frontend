<template>
  <div class="option-text">
    <VcRadioButton
      v-if="!isRequired"
      :model-value="selected ? 'selected' : ''"
      :name="name"
      value="selected"
      @input="$emit('input', inputValue || undefined)"
    />

    <VcInput
      v-model="inputValue"
      class="option-text__input"
      :maxlength="MAX_LENGTH"
      @input="$emit('input', inputValue || undefined)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, toRef, watch } from "vue";

defineEmits<IEmits>();

const props = defineProps<IProps>();
const MAX_LENGTH = 255;
const propsValue = toRef(props, "value");

const inputValue = ref(propsValue.value);

interface IProps {
  isRequired: boolean;
  value?: string;
  selected?: boolean;
  name: string;
}

interface IEmits {
  (e: "input", value: string | undefined): void;
}

watch(propsValue, (newVal) => {
  if (newVal) {
    inputValue.value = newVal;
  }
});
</script>

<style lang="scss">
.option-text {
  @apply flex gap-3 p-4 items-center odd:bg-neutral-50;

  &__input {
    @apply w-full;
  }
}
</style>
