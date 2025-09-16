<template>
  <VcInput
    v-model="dateOnly"
    :label="label"
    :name="name"
    type="date"
    :disabled="disabledComputed"
    :required="requiredComputed"
    :min="normalizedMin"
    :max="normalizedMax"
    :error="!!computedErrorMessage"
    :message="computedErrorMessage"
    :size="size"
  >
    <template #append="{ focusInput }">
      <VcButton
        type="button"
        variant="no-background"
        icon="calendar"
        :disabled="disabledComputed"
        :aria-label="$t('ui_kit.accessibility.open_calendar')"
        @click.stop="openCalendar(focusInput)"
      />
    </template>
  </VcInput>
</template>

<script setup lang="ts">
import { useVModel } from "@vueuse/core";
import { computed, getCurrentInstance } from "vue";
import { useI18n } from "vue-i18n";
import { toDateOnlyString } from "@/ui-kit/utilities/date";

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

const { t } = useI18n();
const dateOnly = useVModel(props, "modelValue", emit);

const requiredComputed = computed(() => props.required ?? props.isRequired);
const disabledComputed = computed(() => props.disabled ?? props.isDisabled);

const normalizedMin = computed(() => toDateOnlyString(props.min));
const normalizedMax = computed(() => toDateOnlyString(props.max));

/**
 * Safari and Firefox don't enforce min/max validation on manual date input.
 * This provides consistent cross-browser validation.
 */
const computedErrorMessage = computed(() => {
  if (props.errorMessage) {
    return props.errorMessage;
  }

  if (!dateOnly.value || (!normalizedMin.value && !normalizedMax.value)) {
    return undefined;
  }

  const selectedDate = dateOnly.value;

  if (normalizedMin.value && selectedDate < normalizedMin.value) {
    return t("ui_kit.date_selector.min_date_error", { min: normalizedMin.value });
  }

  if (normalizedMax.value && selectedDate > normalizedMax.value) {
    return t("ui_kit.date_selector.max_date_error", { max: normalizedMax.value });
  }

  return undefined;
});

if (import.meta.env.DEV) {
  const vnodeProps = getCurrentInstance()?.vnode.props ?? {};

  if ("isRequired" in vnodeProps) {
    console.warn("VcDateSelector: 'isRequired' prop is deprecated, use 'required' instead.");
  }

  if ("isDisabled" in vnodeProps) {
    console.warn("VcDateSelector: 'isDisabled' prop is deprecated, use 'disabled' instead.");
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
