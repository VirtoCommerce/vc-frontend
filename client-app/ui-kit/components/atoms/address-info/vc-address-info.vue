<template>
  <div class="space-y-2">
    <div>
      <div v-if="address.firstName || address.lastName" class="font-bold">
        {{ address.firstName }} {{ address.lastName }}
      </div>
      <div>
        {{ address.line1 }},&nbsp;
        <template v-if="address.line2">{{ address.line2 }}&nbsp;</template>
        {{ address.city }},&nbsp;
        <template v-if="address.regionName">{{ address.regionName }},&nbsp;</template>
        {{ address.countryName }},&nbsp;
        {{ address.postalCode }}
      </div>
    </div>

    <div>
      <template v-if="address.phone">
        <span class="font-bold mr-1">{{ $t("common.labels.phone") }}:</span>
        {{ address.phone }}
        <br />
      </template>
      <div v-if="address.email">
        <span class="font-bold mr-1">{{ $t("common.labels.email") }}:</span>
        {{ address.email }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface Props {
  // Partial is workaround until address type required fields will by typed & synced
  address: Partial<{
    firstName?: string;
    lastName?: string;
    line1: string;
    line2?: string;
    city: string;
    regionName?: string;
    countryName: string;
    postalCode: string;
    phone?: string;
    email?: string;
  }>;
}

defineProps<Props>();
</script>
