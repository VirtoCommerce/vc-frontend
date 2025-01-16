<template>
  <VcLabel v-if="label" :for-id="componentId" :required="isRequired" :error="!!errorMessage">
    {{ label }}
  </VcLabel>

  <input
    :id="componentId"
    v-model="dateOnly"
    :disabled="isDisabled"
    :name="name"
    class="box-border h-11 w-full min-w-0 appearance-none rounded border border-neutral-300 bg-additional-50 p-3 text-base leading-none outline-none focus:border-neutral-400"
    type="date"
  />
  <div v-if="errorMessage" class="text-xs text-danger">{{ errorMessage }}</div>
</template>

<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import { useComponentId } from "@/ui-kit/composables";

interface IEmits {
  (e: "update:modelValue", value: string | undefined): void;
}

interface IProps {
  label?: string;
  name?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  modelValue?: string;
  errorMessage?: string;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

const componentId = useComponentId("input");
const dateOnly = useVModel(props, "modelValue", emit);
</script>
