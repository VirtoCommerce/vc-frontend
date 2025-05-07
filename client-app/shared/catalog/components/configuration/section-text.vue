<template>
  <div>
    <div class="option-text">
      <VcRadioButton v-model="localValue" :value="customInput" />
      <VcInput
        v-model="customInput"
        :maxlength="MAX_LENGTH"
        class="option-text__input"
        @input="updateValue(customInput)"
        @focus="updateValue(customInput)"
      />
    </div>

    <div v-for="option in section.options" :key="option.id" class="option-text">
      <VcRadioButton v-model="localValue" :value="option.text!">
        {{ option.text }}
      </VcRadioButton>
    </div>

    <div class="option-text">
      <VcRadioButton v-model="localValue" :value="EMPTY_VALUE"> none </VcRadioButton>
    </div>

    <p>Вы выбрали: {{ localValue }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { ConfigurationSectionType } from "@/core/api/graphql/types";
import type { DeepReadonly } from "vue";

interface IProps {
  section: DeepReadonly<ConfigurationSectionType>;
  modelValue?: string;
}

const emit = defineEmits<{
  (e: "update:modelValue", value: string | undefined): void;
}>();
const props = defineProps<IProps>();
const MAX_LENGTH = 255;
const EMPTY_VALUE = "__none__";

const localValue = ref(EMPTY_VALUE);
const customInput = ref("");

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== localValue.value) {
      localValue.value = newValue ?? EMPTY_VALUE;
    }
  },
);

watch(localValue, (newValue) => {
  updateValue(newValue);
});

function updateValue(value: string) {
  if (value === "") {
    return;
  }
  /*
  if (props.section.options?.some((option) => option.text === value)) {
    return;
  }*/

  emit("update:modelValue", value === EMPTY_VALUE ? undefined : value);
}
</script>

<style lang="scss">
.option-text {
  @apply flex gap-3 p-4 items-center odd:bg-neutral-50 w-full;

  &__input {
    @apply w-full;
  }
}
</style>
