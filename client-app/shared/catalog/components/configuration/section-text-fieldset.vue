<template>
  <fieldset role="radiogroup" :aria-label="section.name" class="section-text-fieldset">
    <div v-if="section.allowCustomText" class="section-text-fieldset__option">
      <VcRadioButton
        v-if="!isCustomInputRadioButtonHidden"
        v-model="selectedInput"
        :value="CUSTOM_VALUE"
        :aria-label="customInput ? `Custom option: ${customInput}` : 'Custom option: empty'"
        :name="section.name"
      />
      <VcInput
        v-model="customInput"
        :maxlength="MAX_LENGTH"
        class="section-text-fieldset__input"
        aria-label="Enter custom text"
        @input="updateCustomValue"
        @focus="selectCustomInput"
      />
    </div>

    <template v-if="section.allowTextOptions">
      <div v-for="(option, index) in section.options" :key="option.id" class="section-text-fieldset__option">
        <VcRadioButton
          v-model="selectedInput"
          :value="`${PREDEFINED_PREFIX}${index + 1}`"
          :aria-label="`Option ${index + 1}: ${option.text}`"
          :name="section.name"
        >
          {{ option.text }}
        </VcRadioButton>
      </div>
    </template>

    <div v-if="!section.isRequired" class="section-text-fieldset__option">
      <VcRadioButton v-model="selectedInput" :value="NOT_SELECTED_VALUE" aria-label="No selection" :name="section.name">
        None
      </VcRadioButton>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
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
const PREDEFINED_PREFIX = "predefined";

const customInput = ref("");
const selectedInput = ref(NOT_SELECTED_VALUE);
const isInitialized = ref(false);

const isCustomInputRadioButtonHidden = computed(() => {
  return props.section.isRequired && props.section.allowCustomText && !props.section.allowTextOptions;
});

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

onMounted(() => {
  if (props.section.options?.length === 1 && props.section.isRequired) {
    selectedInput.value = `${PREDEFINED_PREFIX}1`;
  }
});
</script>

<style lang="scss">
.section-text-fieldset {
  @apply border-none p-0 m-0;

  &__option {
    @apply flex gap-3 p-4 items-center odd:bg-neutral-50 w-full;
  }

  &__input {
    @apply w-full;
  }
}
</style>
