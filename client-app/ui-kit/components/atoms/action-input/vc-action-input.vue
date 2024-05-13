<template>
  <div>
    <p v-if="label" class="pb-2 text-base font-black">{{ label }}</p>

    <div class="flex items-start gap-3">
      <VcInput
        v-model.trim="value"
        :placeholder="placeholder"
        :readonly="readonly"
        :disabled="applied || disabled"
        :maxlength="maxLength"
        size="sm"
        @keyup.enter="$emit('apply')"
      />

      <template v-if="!readonly">
        <VcButton
          v-if="applied"
          :aria-label="$t('common.buttons.deny')"
          size="sm"
          color="danger"
          variant="outline"
          :disabled="disabled"
          icon="delete-2"
          @click="$emit('deny')"
        />

        <VcButton
          v-else
          :aria-label="$t('common.buttons.apply')"
          icon="apply"
          size="sm"
          variant="outline"
          :disabled="value.length === 0 || disabled"
          @click="$emit('apply')"
        />
      </template>
    </div>

    <VcInputDetails v-if="errorMessage" :message="errorMessage" error />
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
