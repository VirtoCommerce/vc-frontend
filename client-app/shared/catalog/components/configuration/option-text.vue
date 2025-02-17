<template>
  <div class="option-text">
    <div class="option-text__field">
      <VcRadioButton
        :model-value="selected || isRequired ? 'selected' : ''"
        :name="name"
        value="selected"
        @input="$emit('input', inputValue)"
      />

      <VcInput
        v-model="inputValue"
        class="option-text__input"
        :maxlength="MAX_LENGTH"
        @input="(selected || isRequired) && $emit('input', inputValue)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, toRef, watch } from "vue";

defineEmits<IEmits>();

const props = defineProps<Props>();
const MAX_LENGTH = 255;
const propsValue = toRef(props, "value");

const inputValue = ref(propsValue.value);

interface Props {
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
  @apply flex flex-col gap-3;

  &__field {
    @apply flex gap-3 p-4 items-center odd:bg-neutral-50;
  }

  &__input {
    @apply w-full;
  }

  &__label {
    @apply ml-2 text-sm font-bold;
  }
}
</style>
