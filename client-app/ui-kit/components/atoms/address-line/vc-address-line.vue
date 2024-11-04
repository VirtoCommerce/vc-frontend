<template>
  <span>
    {{ address.line1 }},
    <template v-if="address.line2">{{ address.line2 }}</template>
    {{ address.city }},
    <template v-if="address.regionName">{{ address.regionName }},</template>
    {{ address.countryName }},
    {{ address.postalCode }}
  </span>
</template>

<script setup lang="ts">
interface IProps {
  address: AnyAddressType;
}

defineProps<IProps>();
</script>
