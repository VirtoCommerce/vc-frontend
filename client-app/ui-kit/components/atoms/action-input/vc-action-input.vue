<template>
  <div>
    <p v-if="label" class="pb-2 text-base font-black">{{ label }}</p>

    <VcInput
      v-model="value"
      :placeholder="placeholder"
      :readonly="readonly"
      :disabled="applied || disabled"
      :maxlength="maxLength"
      :message="errorMessage"
      :error="!!errorMessage"
      @keyup.enter="$emit('apply')"
    >
      <template v-if="!readonly" #append>
        <VcButton
          v-if="applied"
          :aria-label="$t('common.buttons.deny')"
          color="danger"
          variant="no-background"
          :disabled="disabled"
          icon="delete-2"
          @click="$emit('deny')"
        />

        <VcButton
          v-else
          :aria-label="$t('common.buttons.apply')"
          icon="apply"
          variant="no-background"
          :disabled="value.length === 0 || disabled || !!errorMessage"
          @click="$emit('apply')"
        />
      </template>
    </VcInput>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface IEmits {
  (event: "update:modelValue", value: string): void;
  (event: "apply"): void;
  (event: "deny"): void;
}

interface IProps {
  modelValue: string;
  label?: string;
  placeholder?: string;
  errorMessage?: string;
  applied?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  maxLength?: number;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

const value = computed({
  get: () => props.modelValue,
  set: (newValue) => emit("update:modelValue", newValue),
});
</script>
