<template>
  <form class="flex flex-col gap-y-3">
    <VcInput
      :model-value="number.replace(/(.{4})/g, '$1 ')"
      @update:model-value="number = $event.replace(/\D/g, '')"
      :label="$t('shared.payment.bank_card_form.number_label')"
      :error-message="formErrors.number || errors.number"
      :is-readonly="isReadonly"
      :is-disabled="isDisabled"
      placeholder="1111 1111 1111 1111"
      minlength="16"
      maxlength="23"
      is-required
      @input="input"
    />

    <VcInput
      v-model="cardholderName"
      :label="$t('shared.payment.bank_card_form.cardholder_name_label')"
      :error-message="formErrors.cardholderName || errors.cardholderName"
      :is-readonly="isReadonly"
      :is-disabled="isDisabled"
      is-required
      @input="input"
    />

    <div class="flex flex-col md:flex-row gap-x-6 gap-y-3">
      <VcInput
        v-model="month"
        :label="$t('shared.payment.bank_card_form.month_label')"
        :placeholder="$t('shared.payment.bank_card_form.month_placeholder')"
        :error-message="formErrors.month || errors.month"
        :is-readonly="isReadonly"
        :is-disabled="isDisabled"
        minlength="2"
        maxlength="2"
        class="basis-1/3"
        is-required
        @input="input"
      />

      <VcInput
        v-model="year"
        :label="$t('shared.payment.bank_card_form.year_label')"
        :placeholder="$t('shared.payment.bank_card_form.year_placeholder')"
        :error-message="formErrors.year || errors.year"
        :is-readonly="isReadonly"
        :is-disabled="isDisabled"
        minlength="2"
        maxlength="2"
        class="basis-1/3"
        is-required
        @input="input"
      />

      <VcInput
        v-model="securityCode"
        :label="$t('shared.payment.bank_card_form.security_code_label')"
        :error-message="formErrors.securityCode || errors.securityCode"
        :is-readonly="isReadonly"
        :is-disabled="isDisabled"
        placeholder="111"
        minlength="3"
        maxlength="4"
        class="basis-1/3"
        is-required
        @input="input"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import { PropType, ref, watch } from "vue";
import { useForm, useField } from "vee-validate";
import * as yup from "yup";
import { clone } from "lodash";
import { BankCardErrorsType, BankCardType } from "@/shared/payment";
import { useI18n } from "vue-i18n";

const props = defineProps({
  isReadonly: Boolean,
  isDisabled: Boolean,

  modelValue: {
    type: Object as PropType<BankCardType>,
    required: true,
  },

  valid: {
    type: Boolean,
    default: false,
  },

  errors: {
    type: Object as PropType<BankCardErrorsType>,
    default: () => ({}),
  },
});

const emit = defineEmits<{
  (event: "update:modelValue", bankCardData: BankCardType): void;
  (event: "update:valid", value: boolean): void;
}>();

const { t } = useI18n();

const initialValues = ref<BankCardType>(clone(props.modelValue));

const validationSchema = yup.object({
  number: yup.string().label(t("shared.payment.bank_card_form.number_label")).min(13).max(19).required(),
  cardholderName: yup.string().label(t("shared.payment.bank_card_form.cardholder_name_label")).required(),
  month: yup.string().label(t("shared.payment.bank_card_form.month_label")).length(2).required(),
  year: yup.string().label(t("shared.payment.bank_card_form.year_label")).length(2).required(),
  securityCode: yup.string().label(t("shared.payment.bank_card_form.security_code_label")).min(3).max(4).required(),
});
const { values, meta, errors: formErrors } = useForm<BankCardType>({ validationSchema, initialValues });

const { value: number } = useField<string>("number");
const { value: cardholderName } = useField<string>("cardholderName");
const { value: month } = useField<string>("month");
const { value: year } = useField<string>("year");
const { value: securityCode } = useField<string>("securityCode");

function input() {
  emit("update:modelValue", { ...values });
}

watch(
  () => props.modelValue,
  (value) => (initialValues.value = { ...value }),
  { deep: true }
);

watch(
  () => meta.value.valid,
  () => emit("update:valid", meta.value.valid),
  { immediate: true }
);
</script>
