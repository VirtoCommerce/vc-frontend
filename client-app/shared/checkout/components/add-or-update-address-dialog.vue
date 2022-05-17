<template>
  <VcPopup
    :title="$t('shared.checkout.add_or_update_address_dialog.title')"
    modal-width="max-w-5xl"
    :hide-actions="true"
  >
    <template #default="{ close }">
      <AddressForm
        :model-value="editableAddress"
        :countries="countries"
        class="px-6 py-4"
        required-email
        required-city
        @save="saveAddress"
      >
        <template #append="{ dirty }">
          <div class="flex space-x-4 pb-3 pt-7 sm:pb-4 sm:pt-4 sm:float-right">
            <VcButton
              kind="secondary"
              size="md"
              class="uppercase w-1/2 sm:px-5"
              is-outline
              @click="
                editableAddress = null;
                close();
              "
            >
              {{ $t("shared.checkout.add_or_update_address_dialog.cancel_button") }}
            </VcButton>

            <VcButton size="md" :is-disabled="!dirty" class="uppercase w-1/2 sm:px-5" is-submit>
              {{
                editableAddress
                  ? $t("shared.checkout.add_or_update_address_dialog.save_button")
                  : $t("shared.checkout.add_or_update_address_dialog.create_button")
              }}
            </VcButton>
          </div>
        </template>
      </AddressForm>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { MemberAddressType } from "@/core/api/graphql/types";
import { useCountries } from "@/core/composables";
import { AddressForm } from "@/shared/account";
import { onMounted, PropType, ref, Ref, watchEffect } from "vue";
import { VcPopup, VcButton } from "@/components";
import { clone } from "lodash";

const props = defineProps({
  address: {
    type: Object as PropType<MemberAddressType>,
    default: null,
  },
});

const { countries, loadCountries } = useCountries();
const editableAddress: Ref<MemberAddressType | null> = ref(null);

const emit = defineEmits(["result"]);

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
