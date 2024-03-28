<template>
  <form class="overflow-x-hidden" @submit.prevent="save">
    <slot name="prepend" v-bind="slotsData" />

    <div :class="{ 'md:flex md:flex-row': withPersonalInfo }">
      <div v-if="withPersonalInfo" class="md:w-1/2">
        <VcInput
          v-model="firstName"
          :message="errors.firstName"
          :error="!!errors.firstName"
          :disabled="disabled"
          :label="$t('common.labels.first_name')"
          class="mb-4"
          required
          :maxlength="64"
        />

        <VcInput
          v-model="lastName"
          :message="errors.lastName"
          :error="!!errors.lastName"
          :disabled="disabled"
          :label="$t('common.labels.last_name')"
          class="mb-4"
          required
          :maxlength="64"
        />

        <VcInput
          v-model="email"
          :message="errors.email"
          :error="!!errors.email"
          :disabled="disabled"
          :required="requiredEmail"
          :label="$t('common.labels.email')"
          class="mb-4"
          :maxlength="64"
        />

        <VcInput
          v-model="phone"
          :message="errors.phone"
          :error="!!errors.phone"
          :disabled="disabled"
          :required="requiredPhone"
          :label="$t('common.labels.phone')"
          class="mb-4"
          :maxlength="64"
        />
      </div>

      <!-- Divider -->
      <div
        v-if="withPersonalInfo"
        class="-mx-96 mb-6 mt-8 border-t border-[color:var(--color-primary)] md:mx-9 md:mb-4 md:mt-6 md:border-l"
      />

      <div :class="{ 'md:w-1/2': withPersonalInfo }">
        <VcInput
          v-if="withDescriptionField"
          v-model="description"
          :message="(errors as Record<string, string>).description"
          :error="!!(errors as Record<string, string>).description"
          :disabled="disabled"
          :label="$t('common.labels.description')"
          class="mb-4"
          :maxlength="128"
        />

        <div class="flex flex-col xl:flex-row xl:flex-wrap">
          <VcSelect
            v-model="country"
            text-field="name"
            :message="errors.countryCode"
            :error="!!errors.countryCode"
            :disabled="disabled"
            :items="countries"
            :label="$t('common.labels.country')"
            :placeholder="$t('common.placeholders.select_country')"
            class="mb-4 w-full xl:w-7/12"
            required
            autocomplete
          />

          <VcInput
            v-model="postalCode"
            :message="errors.postalCode"
            :error="!!errors.postalCode"
            :disabled="disabled"
            :label="$t('common.labels.zip_or_postal_code')"
            class="order-3 mb-4 xl:order-none xl:ml-4 xl:w-4/12 xl:grow"
            required
            :maxlength="32"
          />

          <VcSelect
            v-model="region"
            text-field="name"
            :items="regions"
            :message="errors.regionId"
            :error="!!errors.regionId"
            :required="!!regions.length"
            :disabled="disabled || !regions.length"
            :label="$t('common.labels.region')"
            :placeholder="$t('common.placeholders.select_region')"
            class="order-2 mb-4 xl:order-none xl:w-5/12"
            autocomplete
          />

          <VcInput
            v-model="city"
            :message="errors.city"
            :error="!!errors.city"
            :disabled="disabled"
            :label="$t('common.labels.city')"
            class="order-4 mb-4 xl:order-none xl:ml-4 xl:grow"
            :required="requiredCity"
            :maxlength="128"
          />
        </div>

        <VcInput
          v-model="line1"
          :message="errors.line1"
          :error="!!errors.line1"
          :disabled="disabled"
          :label="$t('common.labels.address_line1')"
          class="mb-4"
          required
          :maxlength="128"
        />

        <VcInput
          v-model="line2"
          :message="errors.line2"
          :error="!!errors.line2"
          :disabled="disabled"
          :label="$t('common.labels.address_line2')"
          class="mb-4"
          :maxlength="128"
        />
      </div>
    </div>

    <slot name="append" v-bind="slotsData" />
  </form>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/yup";
import { useField, useForm } from "vee-validate";
import { computed, watch } from "vue";
import * as yup from "yup";
import { getAddressName, Logger } from "@/core/utilities";
import type { CountryRegionType, CountryType, MemberAddressType } from "@/core/api/graphql/types";

interface IEmits {
  (event: "update:modelValue", address: MemberAddressType): void;
  (event: "save", address: MemberAddressType): void;
}

interface IProps {
  modelValue?: MemberAddressType;
  disabled?: boolean;
  requiredEmail?: boolean;
  requiredPhone?: boolean;
  requiredCity?: boolean;
  withDescriptionField?: boolean;
  withPersonalInfo?: boolean;
  countries?: CountryType[];
}

const emit = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  countries: () => [],
});

const initialValues: MemberAddressType = {
  isDefault: false,
  isFavorite: false,
  firstName: "",
  lastName: "",
  email: "",
  organization: "",
  postalCode: "",
  countryCode: "",
  countryName: "",
  regionId: "",
  regionName: "",
  city: "",
  line1: "",
  line2: "",
  phone: "",
  description: "",
};

const { values, meta, errors, handleSubmit, setErrors, validate, resetForm } = useForm<MemberAddressType>({
  initialValues,
});

const slotsData = computed(() => ({
  setErrors,
  validate,
  reset: resetForm,
  save,
  errors,
  values,
  dirty: meta.value.dirty,
  valid: meta.value.valid,
  validated: meta.value.validated,
  pending: meta.value.pending,
  touched: meta.value.touched,
}));

const emailRules = computed(() => {
  let rules = yup.string().max(64).email().nullable();
  if (props.withPersonalInfo && props.requiredEmail) {
    rules = rules.required();
  }
  return toTypedSchema(rules);
});

const phoneRules = computed(() => {
  let rules = yup.string().max(64).nullable();
  if (props.withPersonalInfo && props.requiredPhone) {
    rules = rules.required();
  }
  return toTypedSchema(rules);
});

const cityRules = computed(() => {
  let rules = yup.string().max(128).nullable();
  if (props.requiredCity) {
    rules = rules.required();
  }
  return toTypedSchema(rules);
});

const regionRules = computed(() => {
  // Do not use computed based on field value cause it may cause infinite loop
  const rules = yup
    .string()
    .nullable()
    .when("countryCode", {
      is: (value: string) => props.countries.find((item) => value === item.id)?.regions.length,
      then: (schema) => schema.required(),
    });
  return toTypedSchema(rules);
});

const firstNameRules = computed(() => {
  let rules = yup.string().max(64).nullable();
  if (props.withPersonalInfo) {
    rules = rules.required();
  }
  return toTypedSchema(rules);
});

const lastNameRules = computed(() => {
  let rules = yup.string().max(64).nullable();
  if (props.withPersonalInfo) {
    rules = rules.required();
  }
  return toTypedSchema(rules);
});

const country = computed<CountryType | undefined>({
  get: () => props.countries.find((item) => countryCode.value === item.id),
  set: (value?: CountryType) => {
    countryCode.value = value?.id ?? "";
    countryName.value = value?.name ?? "";
    regionId.value = "";
    regionName.value = "";
  },
});

const regions = computed<CountryRegionType[]>(() => country.value?.regions ?? []);

const region = computed<CountryRegionType | undefined>({
  get: () => regions.value.find((item) => regionId.value === item.id),
  set: (value?: CountryRegionType) => {
    regionId.value = value?.id ?? "";
    regionName.value = value?.name ?? "";
  },
});

const { value: email } = useField("email", emailRules);
const { value: city } = useField("city", cityRules);
const { value: phone } = useField("phone", phoneRules);
const { value: firstName } = useField("firstName", firstNameRules);
const { value: lastName } = useField("lastName", lastNameRules);
const { value: postalCode } = useField("postalCode", toTypedSchema(yup.string().max(32).required().nullable()));
const { value: countryCode } = useField("countryCode", toTypedSchema(yup.string().required().nullable()));
const { value: countryName } = useField("countryName", toTypedSchema(yup.string().max(128).nullable()));
const { value: regionName } = useField("regionName", toTypedSchema(yup.string().max(128).nullable()));
const { value: regionId } = useField("regionId", regionRules);
const { value: line1 } = useField("line1", toTypedSchema(yup.string().max(128).required().nullable()));
const { value: line2 } = useField("line2", toTypedSchema(yup.string().max(128).nullable()));
const { value: description } = useField("description", toTypedSchema(yup.string().max(128).nullable()));

const save = handleSubmit((address) => {
  const newAddress: MemberAddressType = { ...address, name: getAddressName(address) };
  emit("update:modelValue", newAddress);
  emit("save", newAddress);
}, Logger.debug);

watch(
  () => props.modelValue,
  (modelValue) => {
    resetForm({ values: modelValue });
  },
  { deep: true, immediate: true },
);
</script>
