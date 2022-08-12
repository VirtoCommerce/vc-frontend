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
    <div class="px-6 py-5 space-y-4">
      <h3 class="text-xl font-extrabold uppercase">
        {{ $t("shared.company.add_or_update_address_dialog.content_title") }}
      </h3>

      <VcInput
        v-model="payload.description"
        :label="$t('shared.company.add_or_update_address_dialog.description_field_label')"
        class="flex flex-col flex-1"
      />

      <div class="flex space-x-5">
        <VcSelect
          v-model="payload.countryCode"
          :items="countries"
          :label="$t('shared.company.add_or_update_address_dialog.country_field_label')"
          class="flex-1"
          size="lg"
          is-required
          text-field="name"
        />

        <VcInput
          v-model="postalCode"
          :label="$t('shared.company.add_or_update_address_dialog.postal_code_field_label')"
          class="flex-1"
          is-required
        />
      </div>

      <div class="flex space-x-5">
        <VcSelect
          v-model="region"
          :items="regions"
          :label="$t('shared.company.add_or_update_address_dialog.region_field_label')"
          class="flex-1"
          size="lg"
          text-field="name"
        />

        <VcInput
          v-model="city"
          :label="$t('shared.company.add_or_update_address_dialog.city_field_label')"
          class="flex-1"
          is-required
        />
      </div>

      <VcInput
        v-model="line1"
        :label="$t('shared.company.add_or_update_address_dialog.line_1_field_label')"
        class="flex-1"
      />

      <VcInput
        v-model="line2"
        :label="$t('shared.company.add_or_update_address_dialog.line_2_field_label')"
        class="flex-1"
      />

      <VcCheckbox v-model="isDefault">
        <span>{{ $t("shared.company.add_or_update_address_dialog.set_as_default_label") }}</span>
      </VcCheckbox>
    </div>

    <template #actions></template>
  </VcPopup>
</template>

<script setup lang="ts">
import { useCountries } from "@/core/composables";
import { onMounted, PropType } from "vue";
import VcCheckbox from "@/ui-kit/components/atoms/checkbox/vc-checkbox.vue";
import { MemberAddressType } from "@/xapi/types";

defineProps({
  address: {
    type: Object as PropType<MemberAddressType>,
  },
});

const { countries, loadCountries } = useCountries();

onMounted(async () => {
  if (!countries.value.length) {
    await loadCountries();
  }
});
</script>
