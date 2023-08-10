<template>
  <form class="flex flex-col gap-y-3" autocomplete="off">
    <VcInput
      v-mask="'#### #### #### #### ###'"
      :model-value="number.replace(/(.{4})/g, '$1 ')"
      :label="$t('shared.payment.bank_card_form.number_label')"
      :message="formErrors.number || errors.number"
      :error="!!formErrors.number || !!errors.number"
      :readonly="readonly"
      :disabled="disabled"
      placeholder="1111 1111 1111 1111"
      minlength="14"
      maxlength="23"
      required
      @update:model-value="number = $event.replace(/\D/g, '')"
      @input="input"
    />

    <VcInput
      v-model.trim="cardholderName"
      :label="$t('shared.payment.bank_card_form.cardholder_name_label')"
      :message="formErrors.cardholderName || errors.cardholderName"
      :error="!!formErrors.cardholderName || !!errors.cardholderName"
      :readonly="readonly"
      :disabled="disabled"
      required
      @input="input"
    />

    <div class="flex flex-col gap-x-6 gap-y-3 sm:flex-row">
      <VcInput
        v-model="expirationDate"
        v-mask="'## / ##'"
        :label="$t('shared.payment.bank_card_form.expiration_date_label')"
        :placeholder="$t('shared.payment.bank_card_form.expiration_date_placeholder')"
        :message="expirationDateErrors"
        :error="!!expirationDateErrors"
        :readonly="readonly"
        :disabled="disabled"
        name="expirationDate"
        autocomplete="off"
        minlength="7"
        maxlength="7"
        class="basis-1/4"
        required
        @input="input"
      />

      <VcInput
        v-model="securityCode"
        v-mask="'####'"
        :label="$t('shared.payment.bank_card_form.security_code_label')"
        :message="formErrors.securityCode || errors.securityCode"
        :error="!!formErrors.securityCode || !!errors.securityCode"
        :readonly="readonly"
        :disabled="disabled"
        type="password"
        placeholder="111"
        name="securityCode"
        autocomplete="off"
        minlength="3"
        maxlength="4"
        class="basis-1/4"
        hide-password-switcher
        required
        @input="input"
        @keyup.enter="$emit('submit')"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { clone } from "lodash";
import { useField, useForm } from "vee-validate";
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { object, string } from "yup";
import type { BankCardErrorsType, BankCardType } from "@/shared/payment";

interface IEmits {
  (event: "update:modelValue", bankCardData: Partial<BankCardType>): void;
  (event: "update:valid", value: boolean): void;
  (event: "submit"): void;
}

interface IProps {
  modelValue: BankCardType;
  valid?: boolean;
  readonly?: boolean;
  disabled?: boolean;
  errors?: BankCardErrorsType;
}

const emit = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  errors: () => ({}),
});

const { t } = useI18n();

const initialValues = ref<BankCardType>(clone(props.modelValue));

const validationSchema = toTypedSchema(
  object({
    number: string().required().min(12).max(19),
    cardholderName: string().required().max(64),
    month: string()
      .required()
      .length(2)
      .matches(/^(0?[1-9]|1[012])$/, t("shared.payment.authorize_net.errors.month")),
    year: string().when("month", {
      is: (monthValue?: string) => monthValue?.length === 2,
      then: (stringSchema) => stringSchema.length(2),
    }),
    securityCode: string().required().min(3).max(4),
  }),
);

const { values, meta, errors: formErrors } = useForm<BankCardType>({ validationSchema, initialValues });

const { value: number } = useField<string>("number", undefined, { syncVModel: false });
const { value: cardholderName } = useField<string>("cardholderName", undefined, { syncVModel: false });
const { value: month } = useField<string>("month", undefined, { syncVModel: false });
const { value: year } = useField<string>("year", undefined, { syncVModel: false });
const { value: securityCode } = useField<string>("securityCode", undefined, { syncVModel: false });

const expirationDate = computed({
  get: () => (month.value.length > 1 || year.value ? `${month.value || "  "} / ${year.value}` : month.value),
  set(value: string) {
    const [rawMonth = "", rawYear = ""] = value.split(/\s*\/\s*/);
    month.value = rawMonth;
    year.value = rawYear;
  },
});

const expirationDateErrors = computed<string>(() =>
  [formErrors.value.month, formErrors.value.year, props.errors.month, props.errors.year].filter(Boolean).join(". "),
);

function input() {
  emit("update:modelValue", clone(values));
}

watch(
  () => props.modelValue,
  (value) => (initialValues.value = clone(value)),
  { deep: true },
);

watch(
  () => meta.value.valid,
  (value) => emit("update:valid", value),
  { immediate: true },
);
</script>
