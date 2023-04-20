<template>
  <VcPopup :title="title" modal-width="max-w-5xl" hide-actions is-mobile-fullscreen>
    <template #default="{ close }">
      <VcAddressForm
        :model-value="editableAddress"
        :countries="countries"
        :disabled="loading"
        class="px-6 py-4"
        with-personal-info
        required-email
        required-city
        @save="saveAddress"
      >
        <template #append="{ dirty, valid }">
          <div class="flex flex-row space-x-4 pb-3 pt-7 sm:float-right sm:py-4">
            <VcButton kind="secondary" size="md" class="w-1/2 uppercase sm:px-5" is-outline @click="close">
              {{ $t("common.buttons.cancel") }}
            </VcButton>

            <VcButton
              :is-disabled="!dirty || !valid"
              :is-waiting="loading"
              ize="md"
              class="w-1/2 uppercase sm:px-5"
              is-submit
            >
              {{ saveButtonLabel }}
            </VcButton>
          </div>
        </template>
      </VcAddressForm>
    </template>
  </VcPopup>
</template>

<script setup lang="ts">
import { clone } from "lodash";
import { computed, onMounted, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useCountries } from "@/core/composables";
import type { MemberAddressType } from "@/xapi/types";

interface IEmits {
  (event: "result", address: MemberAddressType): void;
}

interface IProps {
  address?: MemberAddressType;
  loading?: boolean;
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

const { countries, loadCountries } = useCountries();
const { t } = useI18n();

const editableAddress = ref<MemberAddressType>();

const title = computed<string>(() =>
  editableAddress.value ? t("common.titles.edit_address") : t("common.titles.new_address")
);
const saveButtonLabel = computed(() => (editableAddress.value ? t("common.buttons.save") : t("common.buttons.create")));

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
