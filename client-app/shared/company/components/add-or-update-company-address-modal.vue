<template>
  <VcModal
    :title="
      $t(
        !address
          ? 'shared.company.add_or_update_address_modal.create_title'
          : 'shared.company.add_or_update_address_modal.edit_title',
      )
    "
    hide-actions
    is-mobile-fullscreen
    dividers
  >
    <template #default="{ close }">
      <h3 class="mb-3 text-xl font-black uppercase">
        {{ $t("shared.company.add_or_update_address_modal.address_title") }}
      </h3>

      <VcAddressForm
        :model-value="address"
        :countries="countries"
        :disabled="loading"
        with-description-field
        required-city
        @save="saveAddress"
      >
        <template #append="{ dirty, valid }">
          <div class="flex flex-wrap items-center justify-center gap-4 py-4 *:max-sm:flex-1 sm:justify-end">
            <VcButton min-width="9rem" :disabled="loading" color="secondary" variant="outline" @click="close">
              {{ $t("common.buttons.cancel") }}
            </VcButton>

            <VcButton min-width="9rem" :disabled="!valid || !dirty" :loading="loading" type="submit">
              {{ $t("common.buttons.save") }}
            </VcButton>
          </div>
        </template>
      </VcAddressForm>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useCountries } from "@/core/composables";
import type { MemberAddressType } from "@/core/api/graphql/types";

export interface IEmits {
  (event: "result", addess: MemberAddressType): void;
}

export interface IProps {
  address?: MemberAddressType;
  loading?: boolean;
}

const emit = defineEmits<IEmits>();

defineProps<IProps>();

const { countries, loadCountries } = useCountries();

function saveAddress(address: MemberAddressType) {
  emit("result", address);
}

onMounted(async () => {
  if (!countries.value.length) {
    await loadCountries();
  }
});
</script>
