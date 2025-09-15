<template>
  <VcInput
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
    :size="size"
  >
    <template #append="{ focusInput }">
      <VcButton
        type="button"
        variant="no-background"
        icon="calendar"
        :disabled="disabledComputed"
        @click.stop="openCalendar(focusInput)"
      />
    </template>
  </VcInput>
</template>

<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import { computed, getCurrentInstance } from "vue";
import { Logger } from "@/core/utilities/logger";

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
  size?: VcInputSizeType;
  min?: string;
  max?: string;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

const dateOnly = useVModel(props, "modelValue", emit);

const requiredComputed = computed(() => props.required ?? props.isRequired);
const disabledComputed = computed(() => props.disabled ?? props.isDisabled);

if (import.meta.env.DEV) {
  const vnodeProps = getCurrentInstance()?.vnode.props ?? {};

  if ("isRequired" in vnodeProps) {
    Logger.warn("VcDateSelector: 'isRequired' prop is deprecated, use 'required' instead.");
  }

  if ("isDisabled" in vnodeProps) {
    Logger.warn("VcDateSelector: 'isDisabled' prop is deprecated, use 'disabled' instead.");
  }
}

function openCalendar(focusInput: () => void): void {
  focusInput();
  const el = document.activeElement as HTMLInputElement | null;

  if (!el || el.type !== "date") {
    return;
  }

  if (typeof el.showPicker === "function") {
    el.showPicker();
  } else {
    el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  }
}
</script>
