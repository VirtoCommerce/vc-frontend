<template>
  <VcPopup
    :title="
      $t(
        !address
          ? 'shared.company.add_or_update_address_dialog.create_title'
          : 'shared.company.add_or_update_address_dialog.edit_title'
      )
    "
    :hide-actions="true"
    is-mobile-fullscreen
  >
    <template #default="{ close }">
      <h3 class="mt-5 mx-6 text-2xl font-extrabold uppercase">
        {{ $t("shared.company.add_or_update_address_dialog.address_title") }}
      </h3>

      <VcAddressForm
        :model-value="address"
        :countries="countries"
        :loading="loading"
        exclude-personal-info
        class="px-6 py-4"
        with-description-field
        required-city
        @save="saveAddress"
      >
        <template #append="{ dirty, valid }">
          <div class="flex space-x-4 pb-3 pt-7 sm:pb-4 sm:pt-4 sm:float-right">
            <VcButton class="uppercase flex-grow md:w-32 md:flex-grow-0" kind="secondary" is-outline @click="close">
              {{ $t("common.buttons.cancel") }}
            </VcButton>

            <VcButton
              :is-disabled="!valid || !dirty"
              :is-waiting="loading"
              is-submit
              class="uppercase flex-grow md:w-32 md:flex-grow-0"
            >
              {{ $t("common.buttons.save") }}
            </VcButton>
          </div>
        </template>
      </VcAddressForm>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { useCountries } from "@/core/composables";
import { onMounted, PropType } from "vue";
import { MemberAddressType } from "@/xapi/types";

defineProps({
  address: {
    type: Object as PropType<MemberAddressType | null>,
    default: null,
  },
  loading: {
    type: Boolean,
  },
});

const emit = defineEmits(["result"]);

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
