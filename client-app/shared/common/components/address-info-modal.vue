<template>
  <VcModal :title="$t(`${TRANSLATION_KEYS_ORIGIN}.pick_point_info`)" max-width="40rem" icon="check">
    <VcTable hide-default-footer hide-default-header :columns="TABLE_COLUMNS" :items="tableItems">
      <template #desktop-body>
        <tbody>
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

      <VcButton @click="close">
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

const props = defineProps<IProps>();

const TRANSLATION_KEYS_ORIGIN = "pages.account.order_details.bopis";

const TABLE_COLUMNS = [{ id: "label" }, { id: "text" }];

const tableItems = computed(() => {
  return [];
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
  &__link {
    @apply py-1 text-[--header-top-link-color] hover:text-[--header-top-link-hover-color];
  }

  &__label {
    @apply font-bold;
  }
}
</style>
