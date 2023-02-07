<template>
  <div class="space-y-2">
    <div class="flex flex-col">
      <span class="font-bold">{{ address.firstName }} {{ address.lastName }}</span>
      <VcAddressLine :address="address" />
    </div>

    <div class="empty:hidden flex flex-col">
      <span v-if="address.phone">
        <span class="font-bold mr-1">{{ $t("common.labels.phone") }}:</span>
        {{ address.phone }}
      </span>

      <span v-if="address.email">
        <span class="font-bold mr-1">{{ $t("common.labels.email") }}:</span>
        {{ address.email }}
      </span>
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
