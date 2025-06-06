<template>
  <VcModal :title="title" max-width="40rem">
    <div v-if="eta">{{ $t(`${TRANSLATION_KEYS_ORIGIN}.eta`) }}: {{ eta }}</div>
    <!-- todo translation and formating -->
    <div>
      {{ $t(`${TRANSLATION_KEYS_ORIGIN}.questions`) }}
      <i18n-t v-if="props.address.email || props.address.phone" :keypath="contactKey">
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
    </div>
    <div>
      Address: {{ address.line1 }}, {{ address.line2 }}, {{ address.city }}, {{ address.regionId }}, {{ address.zip }}
    </div>
    <template #actions="{ close }">
      <GetDirectionsAction size="md" />

      <VcButton @click="close">
        {{ $t("common.buttons.ok") }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { computed } from "vue";
import GetDirectionsAction from "./get-directions-action.vue";
import type { OrderAddressType } from "@/core/api/graphql/types.ts";

type AddressType = Pick<
  OrderAddressType,
  | "phone"
  | "email"
  | "zip"
  | "countryName"
  | "regionName"
  | "regionId"
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
  address: AddressType;
}

const props = defineProps<IProps>();
const title = computed(() => "Pick point info");

const TRANSLATION_KEYS_ORIGIN = "pages.account.order_details.bopis";

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
</script>

<style lang="scss">
.address-info-modal {
  &__link {
    @apply py-1 text-[--header-top-link-color] hover:text-[--header-top-link-hover-color];
  }
}
</style>
