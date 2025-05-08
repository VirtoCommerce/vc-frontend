<template>
  <fieldset role="radiogroup" :aria-label="section.name" class="section-text-fieldset">
    <div v-if="section.allowCustomText" class="section-text-fieldset__option">
      <VcRadioButton
        v-if="!isCustomInputRadioButtonHidden"
        v-model="selectedInput"
        :value="CUSTOM_VALUE"
        :aria-label="
          customInput
            ? $t(constructLocaleKey('custom_option_with_input'), [customInput])
            : $t(constructLocaleKey('custom_option_empty'))
        "
        :name="section.name"
      />
      <VcInput
        v-model="customInput"
        :maxlength="MAX_LENGTH"
        class="section-text-fieldset__input"
        :aria-label="$t(constructLocaleKey('enter_custom_text'))"
        @input="updateCustomValue"
        @focus="selectCustomInput"
      />
    </div>

    <template v-if="section.allowTextOptions">
      <div v-for="(option, index) in section.options" :key="option.id" class="section-text-fieldset__option">
        <VcRadioButton
          v-model="selectedInput"
          :value="addPrefixAndSpace(index + 1)"
          :aria-label="$t(constructLocaleKey('option_label'), [index + 1, option.text])"
          :name="section.name"
        >
          {{ option.text }}
        </VcRadioButton>
      </div>
    </template>

    <div v-if="!section.isRequired" class="section-text-fieldset__option">
      <VcRadioButton
        v-model="selectedInput"
        :value="NOT_SELECTED_VALUE"
        :aria-label="$t(constructLocaleKey('no_selection'))"
        :name="section.name"
      >
        {{ $t(constructLocaleKey("none")) }}
      </VcRadioButton>
    </div>
  </fieldset>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
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
const { t } = useI18n();

const isInitialized = ref(false);

const TRANSLATION_KEYS_ORIGIN = "shared.catalog.product_details.product_configuration.section-text-fieldset";

const MAX_LENGTH = 255;

const NOT_SELECTED_VALUE = computed(() => t(constructLocaleKey("no_selection")));
const CUSTOM_VALUE = computed(() => t(constructLocaleKey("custom_input")));
const PREDEFINED_PREFIX = computed(() => t(constructLocaleKey("predefined_prefix")));

const customInput = ref("");
const selectedInput = ref(NOT_SELECTED_VALUE.value);

const isCustomInputRadioButtonHidden = computed(() => {
  return props.section.isRequired && props.section.allowCustomText && !props.section.allowTextOptions;
});

watch(selectedInput, (newValue) => {
  if (newValue === CUSTOM_VALUE.value) {
    emit("update", customInput.value || undefined);
  } else if (newValue === NOT_SELECTED_VALUE.value) {
    emit("update", undefined);
  } else {
    // Extract index from predefined_N
    const index = removePrefixAndSpace(newValue) - 1;
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
    selectedInput.value = addPrefixAndSpace(optionIndex + 1);
  } else {
    selectedInput.value = CUSTOM_VALUE.value;
    customInput.value = newValue;
  }
  isInitialized.value = true;
}

function updateCustomValue(event: Event) {
  const target = event.target as HTMLInputElement;

  if (selectedInput.value !== CUSTOM_VALUE.value) {
    selectedInput.value = CUSTOM_VALUE.value;
  }

  emit("update", target.value || undefined);
}

function selectCustomInput() {
  selectedInput.value = CUSTOM_VALUE.value;
}

function constructLocaleKey(key: string) {
  return `${TRANSLATION_KEYS_ORIGIN}.${key}`;
}

function addPrefixAndSpace(index: number) {
  return `${PREDEFINED_PREFIX.value} ${index}`;
}

function removePrefixAndSpace(value: string) {
  return parseInt(value.replace(`${PREDEFINED_PREFIX.value} `, ""));
}

onMounted(() => {
  if (props.section.options?.length === 1 && props.section.isRequired) {
    selectedInput.value = addPrefixAndSpace(1);
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
