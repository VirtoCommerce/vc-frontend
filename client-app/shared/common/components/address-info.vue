<template>
  <div class="space-y-2">
    <div class="flex flex-col">
      <span class="font-bold">{{ address.firstName }} {{ address.lastName }}</span>
      <AddressLine :address="address" />
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
import AddressLine from "./address-line.vue";
import type { AnyAddressType } from "@/core/types";

interface IProps {
  address: AnyAddressType;
}

defineProps<IProps>();
</script>
