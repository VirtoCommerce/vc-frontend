<template>
  <form class="overflow-x-hidden" @submit.prevent="save">
    <slot name="prepend" v-bind="slotsData" />

    <div class="md:flex">
      <div class="md:w-1/2">
        <VcInput
          v-model="firstName"
          :error-message="errors.firstName"
          :is-disabled="disabled"
          label="First Name"
          class="mb-4"
          is-required
        />

        <VcInput
          v-model="lastName"
          :error-message="errors.lastName"
          :is-disabled="disabled"
          label="Last Name"
          class="mb-4"
          is-required
        />

        <VcInput
          v-model="email"
          :error-message="errors.email"
          :is-disabled="disabled"
          :is-required="requiredEmail"
          label="Work email"
          class="mb-4"
        />

        <VcInput
          v-model="phone"
          :error-message="errors.phone"
          :is-disabled="disabled"
          :is-required="requiredPhone"
          label="Phone"
          class="mb-4"
        />
      </div>

      <!-- Divider -->
      <div class="border-t md:border-l border-yellow-500 mt-8 mb-6 md:mt-6 md:mb-4 -mx-96 md:mx-9"></div>

      <div class="md:w-1/2">
        <div class="flex flex-col xl:flex-row xl:flex-wrap">
          <VcSelect
            v-model="country"
            text-field="name"
            :error-message="errors.countryCode"
            :is-disabled="disabled"
            :items="countries"
            label="Country"
            placeholder="Select country"
            class="mb-4 w-full xl:w-7/12"
            size="lg"
            is-required
          />

          <VcInput
            v-model="postalCode"
            :error-message="errors.postalCode"
            :is-disabled="disabled"
            label="Zip / Postal code"
            class="mb-4 order-3 xl:order-none xl:ml-4 xl:w-4/12 xl:flex-grow"
            is-required
          />

          <VcSelect
            v-model="region"
            text-field="name"
            :items="regions"
            :error-message="errors.regionId"
            :is-required="!!regions.length"
            :is-disabled="disabled || !regions.length"
            label="Region"
            placeholder="Select region"
            class="mb-4 order-2 xl:order-none xl:w-5/12"
            size="lg"
          />

          <VcInput
            v-model="city"
            :error-message="errors.city"
            :is-disabled="disabled"
            label="City"
            class="mb-4 order-4 xl:order-none xl:ml-4 xl:flex-grow"
            :is-required="requiredCity"
          />
        </div>

        <VcInput
          v-model="line1"
          :error-message="errors.line1"
          :is-disabled="disabled"
          label="Address"
          class="mb-4"
          is-required
        />

        <VcInput
          v-model="line2"
          :error-message="errors.line2"
          :is-disabled="disabled"
          label="Apt, suite, etc."
          class="mb-4"
        />
      </div>
    </div>

    <slot name="append" v-bind="slotsData" />
  </form>
</template>

<script setup lang="ts">
import { computed, PropType, ref, Ref, watch } from "vue";
import { clone } from "lodash";
import { useForm, useField } from "vee-validate";
import { VcInput, VcSelect } from "@/components";
import { CountryRegionType, CountryType, MemberAddressType } from "@core/api/graphql/types";
import { getAddressName, Logger } from "@core/utilities";
import * as yup from "yup";

const props = defineProps({
  disabled: Boolean,
  requiredEmail: Boolean,
  requiredPhone: Boolean,
  requiredCity: Boolean,

  modelValue: {
    type: Object as PropType<MemberAddressType | null>,
    default: null,
  },

  countries: {
    type: Array as PropType<CountryType[]>,
    default: () => [],
    required: true,
  },
});

const emit = defineEmits<{
  (event: "update:modelValue", address: MemberAddressType): void;
  (event: "save", address: MemberAddressType): void;
}>();

const _emptyAddress: Readonly<MemberAddressType> = {
  isDefault: false,
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
  // FIXME: The values may be NULL. Incorrect behavior of the "dirty" variable
};

const initialValues: Ref<MemberAddressType> = ref(clone(props.modelValue || _emptyAddress));

const {
  values,
  meta,
  errors,
  handleSubmit,
  setValues,
  setErrors,
  validate,
  resetForm: reset,
} = useForm({ initialValues });

const slotsData = computed(() => ({
  setErrors,
  validate,
  reset,
  clear,
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
  if (props.requiredEmail) rules = rules.required();
  return rules;
});

const phoneRules = computed(() => {
  let rules = yup.string().max(64).nullable();
  if (props.requiredPhone) rules = rules.required();
  return rules;
});

const cityRules = computed(() => {
  let rules = yup.string().max(128).nullable();
  if (props.requiredCity) rules = rules.required();
  return rules;
});

const regionRules = computed(() => {
  let rules = yup.string().nullable();
  if (regions.value.length) rules = rules.required();
  return rules;
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

const { value: email } = useField<string>("email", emailRules);
const { value: city } = useField<string>("city", cityRules);
const { value: phone } = useField<string>("phone", phoneRules);
const { value: firstName } = useField<string>("firstName", yup.string().max(64).required().nullable());
const { value: lastName } = useField<string>("lastName", yup.string().max(64).required().nullable());
const { value: postalCode } = useField<string>("postalCode", yup.string().max(32).required().nullable());
const { value: countryCode } = useField<string>("countryCode", yup.string().required().nullable());
const { value: countryName } = useField<string>("countryName", yup.string().max(128).nullable());
const { value: regionName } = useField<string>("regionName", yup.string().max(128).nullable());
const { value: regionId } = useField<string>("regionId", regionRules);
const { value: line1 } = useField<string>("line1", yup.string().max(128).required().nullable());
const { value: line2 } = useField<string>("line2", yup.string().max(128).nullable());

const save = handleSubmit((address) => {
  const newAddress: MemberAddressType = { ...address, name: getAddressName(address) };
  emit("update:modelValue", newAddress);
  emit("save", newAddress);
}, Logger.debug);

function clear() {
  setValues({
    ...props.modelValue,
    ..._emptyAddress,
    isDefault: !!props.modelValue?.isDefault,
  });
}

watch(
  () => props.modelValue,
  (value: MemberAddressType | null) => {
    initialValues.value = clone(value || _emptyAddress);
    setValues(initialValues.value);
  },
  { deep: true }
);
</script>
