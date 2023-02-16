<template>
  <div class="space-y-2">
    <div class="flex flex-col">
      <span class="font-bold">{{ address.firstName }} {{ address.lastName }}</span>
      <VcAddressLine :address="address" />
    </div>

    <div class="flex flex-col empty:hidden">
      <span v-if="address.phone">
        <span class="mr-1 font-bold">{{ $t("common.labels.phone") }}:</span>
        {{ address.phone }}
      </span>

      <span v-if="address.email">
        <span class="mr-1 font-bold">{{ $t("common.labels.email") }}:</span>
        {{ address.email }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { OrderAddressType, QuoteAddressType } from "@/xapi";

defineProps({
  address: {
    type: Object as PropType<QuoteAddressType | OrderAddressType>,
    required: true,
  },
});
</script>
