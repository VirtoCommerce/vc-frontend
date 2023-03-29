<template>
  <span>
    {{ address.line1 }},&nbsp;
    <template v-if="address.line2">{{ address.line2 }}&nbsp;</template>
    {{ address.city }},&nbsp;
    <template v-if="address.regionName">{{ address.regionName }},&nbsp;</template>
    {{ address.countryName }},&nbsp;
    {{ address.postalCode }}
  </span>
</template>

<script setup lang="ts">
import type { AnyAddressType } from "@/core/types";

interface IProps {
  address: AnyAddressType;
}

defineProps<IProps>();
</script>
