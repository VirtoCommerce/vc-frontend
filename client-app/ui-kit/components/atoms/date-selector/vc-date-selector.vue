<template>
  <VcInput
    :id="componentId"
    v-model="dateOnly"
    :label="label"
    :name="name"
    type="date"
    :disabled="disabledComputed"
    :required="requiredComputed"
    :min="min"
    :max="max"
    :error="!!errorMessage"
    :message="errorMessage"
    size="md"
  />
</template>

<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import { useComponentId } from "@/ui-kit/composables";
import { Logger } from "@/core/utilities/logger";
import { computed } from "vue";

interface IEmits {
  (e: "update:modelValue", value: string | undefined): void;
}

interface IProps {
  label?: string;
  name?: string;
  /**
   * @deprecated use `required` instead
   */
  isRequired?: boolean;

  /**
   * @deprecated use `disabled` instead
   */
  isDisabled?: boolean;

  required?: boolean;
  disabled?: boolean;
  modelValue?: string;
  errorMessage?: string;
  min?: string;
  max?: string;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

const componentId = useComponentId("input");
const dateOnly = useVModel(props, "modelValue", emit);

const requiredComputed = computed(() => props.required ?? props.isRequired);
const disabledComputed = computed(() => props.disabled ?? props.isDisabled);

if (import.meta.env.DEV) {
  if (props.isRequired !== undefined) {
    Logger.warn("VcDateSelector: 'isRequired' prop is deprecated, use 'required' instead.");
  }

  if (props.isDisabled !== undefined) {
    Logger.warn("VcDateSelector: 'isDisabled' prop is deprecated, use 'disabled' instead.");
  }
}
</script>
