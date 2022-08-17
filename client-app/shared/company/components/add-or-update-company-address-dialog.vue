<template>
  <VcPopup
    :title="
      $t(
        !address
          ? 'shared.company.add_or_update_address_dialog.create_title'
          : 'shared.company.add_or_update_address_dialog.edit_title'
      )
    "
  >
    <template #default>
      <form class="px-6 py-5 space-y-4">
        <h3 class="text-xl font-extrabold uppercase">
          {{ $t("shared.company.add_or_update_address_dialog.content_title") }}
        </h3>

        <VcInput
          v-model="description"
          :maxlength="128"
          :error-message="errors.description"
          :label="$t('shared.company.add_or_update_address_dialog.description_field_label')"
          class="flex-1"
        />

        <div class="md:flex md:space-x-5">
          <VcSelect
            v-model="country"
            :items="countries"
            :error-message="errors.countryCode"
            :label="$t('shared.company.add_or_update_address_dialog.country_field_label')"
            class="flex-1"
            size="lg"
            is-required
            text-field="name"
          />

          <VcInput
            v-model="postalCode"
            :maxlength="32"
            :error-message="errors.postalCode"
            :label="$t('shared.company.add_or_update_address_dialog.postal_code_field_label')"
            class="flex-1 mt-5 md:mt-0"
            is-required
          />
        </div>

        <div class="md:flex md:space-x-5">
          <VcSelect
            v-model="region"
            :items="regions"
            :error-message="errors.regionId"
            :is-required="!!regions.length"
            :is-disabled="!regions.length"
            :label="$t('shared.company.add_or_update_address_dialog.region_field_label')"
            class="flex-1"
            size="lg"
            text-field="name"
          />

          <VcInput
            v-model="city"
            :maxlength="128"
            :error-message="errors.city"
            :label="$t('shared.company.add_or_update_address_dialog.city_field_label')"
            class="flex-1 mt-5 md:mt-0"
            is-required
          />
        </div>

        <VcInput
          v-model="line1"
          :maxlength="128"
          :error-message="errors.line1"
          :label="$t('shared.company.add_or_update_address_dialog.line_1_field_label')"
          class="flex-1"
        />

        <VcInput
          v-model="line2"
          :maxlength="128"
          :error-message="errors.line2"
          :label="$t('shared.company.add_or_update_address_dialog.line_2_field_label')"
          class="flex-1"
        />
      </form>
    </template>

    <template #actions="{ close }">
      <VcButton class="uppercase w-32" kind="secondary" is-outline @click="close">
        {{ $t("common.buttons.cancel") }}
      </VcButton>

      <VcButton class="uppercase w-32" :is-disabled="!meta.valid" @click="save">
        {{ $t("common.buttons.save") }}
      </VcButton>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { useCountries } from "@/core/composables";
import { onMounted, PropType, ref, Ref, computed, watch } from "vue";
import { CountryRegionType, CountryType, MemberAddressType } from "@/xapi/types";
import { clone } from "lodash";
import { useField, useForm } from "vee-validate";
import * as yup from "yup";
import { getAddressName, Logger } from "@/core/utilities";

const props = defineProps({
  address: {
    type: Object as PropType<MemberAddressType | null>,
    default: null,
  },
});

const { countries, loadCountries } = useCountries();

const _emptyAddress: Readonly<MemberAddressType> = {
  addressType: 3,
  isDefault: false,
  postalCode: "",
  countryCode: "",
  countryName: "",
  regionId: "",
  regionName: "",
  city: "",
  line1: "",
  line2: "",
  description: "",
  // FIXME: The values may be NULL. Incorrect behavior of the "dirty" variable
};

const emit = defineEmits<{
  (event: "save", address: MemberAddressType): void;
}>();

const initialValues: Ref<MemberAddressType> = ref(clone(props.address || _emptyAddress));

const { meta, errors, setValues, handleSubmit } = useForm({ initialValues });

const country = computed<CountryType | undefined>({
  get: () => countries.value.find((item) => countryCode.value === item.id),
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

const regionRules = computed(() => {
  let rules = yup.string().nullable();
  if (regions.value.length) {
    rules = rules.required();
  }
  return rules;
});

const { value: description } = useField<string>("description", yup.string().max(128).nullable());
const { value: city } = useField<string>("city", yup.string().max(128).required().nullable());
const { value: postalCode } = useField<string>("postalCode", yup.string().max(32).required().nullable());
const { value: countryCode } = useField<string>("countryCode", yup.string().required().nullable());
const { value: countryName } = useField<string>("countryName", yup.string().max(128).nullable());
const { value: regionName } = useField<string>("regionName", yup.string().max(128).nullable());
const { value: regionId } = useField<string>("regionId", regionRules);
const { value: line1 } = useField<string>("line1", yup.string().max(128).nullable());
const { value: line2 } = useField<string>("line2", yup.string().max(128).nullable());

onMounted(async () => {
  if (!countries.value.length) {
    await loadCountries();
  }
});

watch(
  () => props.address,
  (value: MemberAddressType | null) => {
    initialValues.value = clone(value || _emptyAddress);
    setValues(initialValues.value);
  },
  { deep: true }
);

const save = handleSubmit((address) => {
  const newAddress: MemberAddressType = { ...address, name: getAddressName(address) };
  emit("save", newAddress);
}, Logger.debug);
</script>
