<template>
  <VcWidget title="Shipment options">
    <VcLoaderOverlay v-if="loading" />
    <div v-for="pickupLocation in pickupLocations" :key="pickupLocation.name" class="mt-2 rounded border p-2">
      <div>
        {{ pickupLocation.name }}
      </div>

      <div>
        {{ pickupLocation.note }}
      </div>
    </div>
  </VcWidget>
</template>

<script setup lang="ts">
import type { ProductPickupLocation } from "@/core/api/graphql/types";

interface IProps {
  pickupLocations?: ProductPickupLocation[];
  loading: boolean;
}

defineProps<IProps>();
</script>
