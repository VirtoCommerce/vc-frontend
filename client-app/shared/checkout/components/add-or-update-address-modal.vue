<template>
  <VcPopup
    :title="
      editableAddress
        ? $t('shared.checkout.add_or_update_address_dialog.edit_address_title')
        : $t('shared.checkout.add_or_update_address_dialog.new_address_title')
    "
    modal-width="max-w-5xl"
    hide-actions
    is-mobile-fullscreen
  >
    <template #default="{ close }">
      <VcAddressForm
        :model-value="editableAddress"
        :countries="countries"
        class="px-6 py-4"
        with-personal-info
        required-email
        required-city
        @save="saveAddress"
      >
        <template #append="{ dirty, valid }">
          <div class="flex flex-row space-x-4 pb-3 pt-7 sm:float-right sm:py-4">
            <VcButton kind="secondary" size="md" class="w-1/2 uppercase sm:px-5" is-outline @click="close">
              {{ $t("shared.checkout.add_or_update_address_dialog.cancel_button") }}
            </VcButton>

            <VcButton size="md" :is-disabled="!dirty || !valid" class="w-1/2 uppercase sm:px-5" is-submit>
              {{
                editableAddress
                  ? $t("shared.checkout.add_or_update_address_dialog.save_button")
                  : $t("shared.checkout.add_or_update_address_dialog.create_button")
              }}
            </VcButton>
          </div>
        </template>
      </VcAddressForm>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { clone } from "lodash";
import { onMounted, ref, watchEffect } from "vue";
import { useCountries } from "@/core/composables";
import type { MemberAddressType } from "@/xapi/types";
import type { PropType, Ref } from "vue";

const emit = defineEmits(["result"]);

const props = defineProps({
  address: {
    type: Object as PropType<MemberAddressType>,
    default: null,
  },
});

const { countries, loadCountries } = useCountries();
const editableAddress: Ref<MemberAddressType | null> = ref(null);

onMounted(async () => {
  if (!countries.value.length) {
    await loadCountries();
  }
});

function saveAddress(address: MemberAddressType) {
  emit("result", address);
}

watchEffect(() => {
  editableAddress.value = clone(props.address);
});
</script>
