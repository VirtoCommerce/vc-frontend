<template>
  <div>
    <div class="font-bold">
      <span>{{ address.firstName }} {{ address.lastName }}</span>
    </div>
    <div>
      <span>{{ address.line1 }},&nbsp;</span>
      <span v-if="address.line2">{{ address.line2 }}&nbsp;</span>
      <span>{{ address.city }},&nbsp;</span>
      <span>{{ address.countryName }},&nbsp;</span>
      <span v-if="address.regionName">{{ address.regionName }},&nbsp;</span>
      <span>{{ address.postalCode }}</span>
    </div>
    <div v-if="address.phone">
      <span class="font-bold mr-1">{{ $t("common.labels.phone") }}:</span>
      <span>{{ address.phone }}</span>
    </div>
    <div v-if="address.email">
      <span class="font-bold mr-1">{{ $t("common.labels.email") }}:</span>
      <span>{{ address.email }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { OrderAddressType, QuoteAddressType } from "@/xapi";
import { PropType } from "vue";

defineProps({
  address: {
    type: Object as PropType<QuoteAddressType | OrderAddressType>,
    required: true,
  },
});
</script>
