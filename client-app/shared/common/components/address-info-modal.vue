<template>
  <VcModal :title="title" max-width="40rem">
    <!-- todo add field -->
    <div>ETA: {{ eta }}</div>
    <!-- todo translation and formating -->
    <div>Questions?: Call {{ address.phone }} or email {{ address.email }}</div>
    <div>
      Address: {{ address.line1 }}, {{ address.line2 }}, {{ address.city }}, {{ address.regionId }}, {{ address.zip }}
    </div>
    <!-- todo format if something missing -->
    <div>Contact person {{ address.firstName }} {{ address.middleName }} {{ address.lastName }}</div>
    Instructions: add field
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
  otherAddress: AddressType;
}

defineProps<IProps>();
const title = computed(() => "Pick point info");
</script>
