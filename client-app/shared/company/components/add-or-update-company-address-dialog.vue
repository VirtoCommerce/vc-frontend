<template>
  <VcPopup
    :title="
      $t(
        !address
          ? 'shared.company.add_or_update_address_dialog.create_title'
          : 'shared.company.add_or_update_address_dialog.edit_title'
      )
    "
    hide-actions
    is-mobile-fullscreen
  >
    <template #default="{ close }">
      <h3 class="mx-6 mt-5 text-2xl font-extrabold uppercase">
        {{ $t("shared.company.add_or_update_address_dialog.address_title") }}
      </h3>

      <VcAddressForm
        :model-value="address"
        :countries="countries"
        :disabled="loading"
        class="px-6 py-4"
        with-description-field
        required-city
        @save="saveAddress"
      >
        <template #append="{ dirty, valid }">
          <div class="flex flex-row space-x-4 pb-3 pt-7 sm:float-right sm:py-4">
            <VcButton :is-disabled="loading" class="w-1/2 uppercase sm:px-5" kind="secondary" is-outline @click="close">
              {{ $t("common.buttons.cancel") }}
            </VcButton>

            <VcButton :is-disabled="!valid || !dirty" :is-waiting="loading" is-submit class="w-1/2 uppercase sm:px-5">
              {{ $t("common.buttons.save") }}
            </VcButton>
          </div>
        </template>
      </VcAddressForm>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useCountries } from "@/core/composables";
import type { MemberAddressType } from "@/xapi/types";
import type { PropType } from "vue";

const emit = defineEmits(["result"]);

defineProps({
  address: {
    type: Object as PropType<MemberAddressType | null>,
    default: null,
  },

  loading: {
    type: Boolean,
  },
});

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
