<template>
  <VcModal
    class="address-info-modal"
    :title="$t(`${TRANSLATION_KEYS_ORIGIN}.pick_point_info`)"
    max-width="35rem"
    icon="check"
  >
    <VcTable hide-default-footer hide-default-header :columns="TABLE_COLUMNS" :items="tableItems">
      <template #desktop-body>
        <tbody class="address-info-modal__table-body">
          <tr v-if="eta">
            <td>
              <span class="address-info-modal__label">{{ $t(`${TRANSLATION_KEYS_ORIGIN}.eta`) }}:</span>
            </td>
            <td>{{ eta }}</td>
          </tr>
          <tr v-if="props.address.email || props.address.phone">
            <td>
              <span class="address-info-modal__label">{{ $t(`${TRANSLATION_KEYS_ORIGIN}.questions`) }}</span>
            </td>
            <td>
              <i18n-t :keypath="contactKey">
                <template #email>
                  <a class="address-info-modal__link" :href="`mailto:${props.address.email}`">
                    {{ props.address.email }}
                  </a>
                </template>

                <template #phone>
                  <a class="address-info-modal__link" :href="`tel:${props.address.phone}`">
                    {{ props.address.phone }}
                  </a>
                </template>
              </i18n-t>
            </td>
          </tr>
          <tr>
            <td>
              <span class="address-info-modal__label">{{ $t(`${TRANSLATION_KEYS_ORIGIN}.address`) }}:</span>
            </td>
            <td>{{ addressSentence }}</td>
          </tr>
        </tbody>
      </template>
    </VcTable>
    <template #actions="{ close }">
      <GetDirectionsAction v-if="link" size="md" :link="link" />

      <VcButton class="address-info-modal__action-ok" @click="close">
        {{ $t("common.buttons.ok") }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { toCSV } from "@/core/utilities";
import GetDirectionsAction from "./get-directions-action.vue";
import type { OrderAddressType } from "@/core/api/graphql/types.ts";

const props = defineProps<IProps>();

type AddressType = Pick<
  OrderAddressType,
  | "phone"
  | "email"
  | "zip"
  | "countryName"
  | "regionName"
  | "city"
  | "line1"
  | "line2"
  | "firstName"
  | "middleName"
  | "lastName"
>;
interface IProps {
  //  Estimated Time of Arrival
  eta?: string;
  link?: string;
  address: AddressType;
}

const TRANSLATION_KEYS_ORIGIN = "pages.account.order_details.bopis";

const TABLE_COLUMNS = [{ id: "label" }];

// Minimal implementation: no table head and no separate mobile layout.
// Extend as needed.
const tableItems = computed(() => {
  return [{ label: "eta" }, { label: "questions" }, { label: "address" }];
});

const contactKey = computed(() => {
  let key = "";
  const email = props.address.email;
  const phone = props.address.phone;

  if (email && phone) {
    key = `${TRANSLATION_KEYS_ORIGIN}.emailAndPhone`;
  } else if (email) {
    key = `${TRANSLATION_KEYS_ORIGIN}.emailOnly`;
  } else if (phone) {
    key = `${TRANSLATION_KEYS_ORIGIN}.phoneOnly`;
  }

  return key;
});

const addressSentence = computed(() => {
  const { line1, line2, city, regionName, zip, countryName } = props.address;
  return toCSV([line1, line2, city, regionName, zip, countryName]);
});
</script>

<style lang="scss">
.address-info-modal {
  &__table-body {
    @apply text-base;
  }

  &__link {
    @apply py-1 text-[--header-top-link-color] hover:text-[--header-top-link-hover-color];
  }

  &__label {
    @apply font-bold;
  }

  &__action-ok {
    @apply ml-auto;
  }
}
</style>
