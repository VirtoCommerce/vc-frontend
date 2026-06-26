<template>
  <div class="vc-action-input">
    <p v-if="label" class="vc-action-input__label">{{ label }}</p>

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
          :aria-label="$t('ui_kit.buttons.deny')"
          color="neutral"
          variant="ghost"
          :disabled="disabled"
          icon="delete-thin"
          size="sm"
          @click="$emit('deny')"
        />

        <VcButton
          v-else
          :aria-label="$t('ui_kit.buttons.apply')"
          icon="apply"
          variant="ghost"
          size="sm"
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

<style lang="scss">
.vc-action-input {
  &__label {
    @apply pb-2 text-base font-black;
  }
}
</style>
