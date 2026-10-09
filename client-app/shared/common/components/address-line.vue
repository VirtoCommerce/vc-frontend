<template>
  <span v-if="addressSentence">
    {{ addressSentence }}
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { toCSV } from "@/core/utilities";
import type { OrderAddressType } from "@/core/api/graphql/types.ts";

type AddressType = Partial<
  Pick<OrderAddressType, "line1" | "line2" | "city" | "regionName" | "postalCode" | "countryName">
>;

interface IProps {
  address: AddressType;
}

const props = defineProps<IProps>();

const addressSentence = computed(() => {
  const { line1, line2, city, regionName, postalCode, countryName } = props.address;
  return toCSV([line1, line2, city, regionName, postalCode, countryName]);
});
</script>
