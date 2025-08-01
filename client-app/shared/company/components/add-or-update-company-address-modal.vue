<template>
  <VcModal :title="title" hide-actions is-mobile-fullscreen>
    <template #default="{ close }">
      <AddressForm
        :model-value="address"
        :countries="countries"
        :disabled="loading"
        with-description-field
        required-city
        @save="saveAddress"
      >
        <template #append="{ dirty, valid }">
          <div class="flex flex-wrap items-center justify-between gap-4 pt-2 *:max-xs:flex-1">
            <VcButton min-width="8rem" :disabled="loading" color="secondary" variant="outline" @click="close">
              {{ $t("common.buttons.cancel") }}
            </VcButton>

            <VcButton min-width="8rem" :disabled="!valid || !dirty" :loading="loading" type="submit">
              {{ $t("common.buttons.save") }}
            </VcButton>
          </div>
        </template>
      </AddressForm>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useCountries } from "@/core/composables";
import { AddressForm } from "@/shared/common";
import type { MemberAddressType } from "@/core/api/graphql/types";

export interface IEmits {
  (event: "result", addess: MemberAddressType): void;
}

export interface IProps {
  address?: MemberAddressType;
  loading?: boolean;
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

const { countries, loadCountries } = useCountries();
const { t } = useI18n();

const title = computed<string>(() =>
  props.address
    ? t("shared.company.add_or_update_address_modal.edit_title")
    : t("shared.company.add_or_update_address_modal.create_title"),
);

function saveAddress(address: MemberAddressType) {
  emit("result", address);
}

onMounted(async () => {
  if (!countries.value.length) {
    await loadCountries();
  }
});
</script>
