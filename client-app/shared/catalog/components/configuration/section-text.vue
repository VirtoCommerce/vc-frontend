<template>
  <div>
    <div class="option-text">
      <VcRadioButton v-model="selectedInput" :value="CUSTOM_VALUE" />
      <VcInput
        v-model="customInput"
        :maxlength="MAX_LENGTH"
        class="option-text__input"
        @input="updateCustomValue"
        @focus="selectCustomInput"
      />
    </div>

    <div v-for="(option, index) in section.options" :key="option.id" class="option-text">
      <VcRadioButton v-model="selectedInput" :value="`${PREDEFINED_PREFIX}${index + 1}`">
        {{ option.text }}
      </VcRadioButton>
    </div>

    <div class="option-text">
      <VcRadioButton v-model="selectedInput" :value="NOT_SELECTED_VALUE"> none </VcRadioButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { ConfigurationSectionType } from "@/core/api/graphql/types";
import type { DeepReadonly } from "vue";

interface IProps {
  section: DeepReadonly<ConfigurationSectionType>;
  initialValue?: string;
}

const emit = defineEmits<{
  (e: "update", value: string | undefined): void;
}>();
const props = defineProps<IProps>();
const MAX_LENGTH = 255;
const NOT_SELECTED_VALUE = "no selection";
const CUSTOM_VALUE = "custom input";
const PREDEFINED_PREFIX = "predefined_";

const customInput = ref("");
const selectedInput = ref(NOT_SELECTED_VALUE);
const isInitialized = ref(false);

watch(selectedInput, (newValue) => {
  if (newValue === CUSTOM_VALUE) {
    emit("update", customInput.value || undefined);
  } else if (newValue === NOT_SELECTED_VALUE) {
    emit("update", undefined);
  } else {
    // Extract index from predefined_N
    const index = parseInt(newValue.replace(PREDEFINED_PREFIX, "")) - 1;
    const option = props.section.options?.[index];
    emit("update", option?.text || undefined);
  }
});

watch(
  () => props.initialValue,
  (newValue) => {
    if (!isInitialized.value && newValue !== undefined) {
      setInitialValue(newValue);
    }
  },
  { immediate: true },
);

function setInitialValue(newValue: string) {
  const optionIndex = props.section.options?.findIndex((el) => el.text === newValue);
  if (optionIndex !== undefined && optionIndex !== -1) {
    selectedInput.value = `${PREDEFINED_PREFIX}${optionIndex + 1}`;
  } else {
    selectedInput.value = CUSTOM_VALUE;
    customInput.value = newValue;
  }
  isInitialized.value = true;
}

function updateCustomValue(event: Event) {
  const target = event.target as HTMLInputElement;

  if (selectedInput.value !== CUSTOM_VALUE) {
    selectedInput.value = CUSTOM_VALUE;
  }

  emit("update", target.value || undefined);
}

function selectCustomInput() {
  selectedInput.value = CUSTOM_VALUE;
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
