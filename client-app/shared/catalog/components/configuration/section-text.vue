<template>
  <div>
    <div class="option-text">
      <VcRadioButton v-model="selectedInput" value="custom" />
      <VcInput
        v-model="customInput"
        :maxlength="MAX_LENGTH"
        class="option-text__input"
        @input="updateCustomValue"
        @focus="selectCustomInput"
      />
    </div>

    <div v-for="option in section.options" :key="option.id" class="option-text">
      <VcRadioButton v-model="selectedInput" :value="option.id!">
        {{ option.text }}
      </VcRadioButton>
    </div>

    <div class="option-text">
      <VcRadioButton v-model="selectedInput" value="none"> none </VcRadioButton>
    </div>
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
// const EMPTY_VALUE = "__none__";
// const CUSTOM_VALUE = "__custom__";

const customInput = ref("");
const selectedInput = ref("none");
const isInitialized = ref(false);

watch(selectedInput, (newValue) => {
  if (newValue === "custom") {
    emit("update:modelValue", customInput.value || undefined);
  } else if (newValue === "none") {
    emit("update:modelValue", undefined);
  } else {
    const option = props.section.options?.find((opt) => opt.id === newValue);
    emit("update:modelValue", option?.text || undefined);
  }
});

watch(
  () => props.modelValue,
  (newValue) => {
    if (!isInitialized.value && newValue !== undefined) {
      setInitialValue(newValue);
    }
  },
  { immediate: true },
);

function setInitialValue(newValue: string) {
  const matchingOption = props.section.options?.find((el) => el.text === newValue);
  if (matchingOption) {
    selectedInput.value = matchingOption.id!;
  } else {
    selectedInput.value = "custom";
    customInput.value = newValue;
  }
  isInitialized.value = true;
}

function updateCustomValue(event: Event) {
  const target = event.target as HTMLInputElement;

  if (selectedInput.value !== "custom") {
    selectedInput.value = "custom";
  }

  emit("update:modelValue", target.value || undefined);
}

function selectCustomInput() {
  selectedInput.value = "custom";
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
