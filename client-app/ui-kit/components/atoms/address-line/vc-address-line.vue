<template>
  <div>
    {{ address.line1 }},&nbsp;
    <template v-if="address.line2">{{ address.line2 }}&nbsp;</template>
    {{ address.city }},&nbsp; {{ address.countryName }},&nbsp;
    <template v-if="address.regionName">{{ address.regionName }},&nbsp;</template>
    {{ address.postalCode }}
  </div>
</template>

<script setup lang="ts">
import { OrderAddressType, QuoteAddressType } from "@/xapi";

interface Props {
  address: QuoteAddressType | OrderAddressType;
}

defineProps<Props>();
</script>
