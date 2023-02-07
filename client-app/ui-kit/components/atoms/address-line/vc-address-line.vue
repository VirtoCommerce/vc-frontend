<template>
  <span>
    {{ address.line1 }},&nbsp;
    <template v-if="address.line2">{{ address.line2 }}&nbsp;</template>
    {{ address.city }},&nbsp; {{ address.countryName }},&nbsp;
    <template v-if="address.regionName">{{ address.regionName }},&nbsp;</template>
    {{ address.postalCode }}
  </span>
</template>

<script setup lang="ts">
import { AnyAddressType } from "@/core";

interface Props {
  address: AnyAddressType;
}

defineProps<Props>();
</script>
