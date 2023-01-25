<template>
  <div class="space-y-2">
    <div>
      <div class="font-bold">{{ address.firstName }} {{ address.lastName }}</div>
      <VcAddressLine :address="address" />
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
import { OrderAddressType, QuoteAddressType } from "@/xapi";
import { PropType } from "vue";

defineProps({
  address: {
    type: Object as PropType<QuoteAddressType | OrderAddressType>,
    required: true,
  },
});
</script>
