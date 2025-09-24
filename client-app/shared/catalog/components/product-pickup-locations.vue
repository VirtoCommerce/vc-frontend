<template>
  <VcWidget :title="$t('shared.catalog.shipment_options.title')" class="pickup-locations">
    <VcLoaderOverlay v-if="loading" />

    <div class="pickup-locations__group">
      <VcImage src="in-store-pickup.svg" :alt="$t('shared.catalog.shipment_options.in_store')" />

      <div>
        <div class="pickup-locations__group-header">
          {{ $t("shared.catalog.shipment_options.in_store") }}
        </div>

        <div v-for="pickupLocation in pickupLocations" :key="pickupLocation.id" class="pickup-locations__option">
          <div class="pickup-locations__option-name">
            {{ pickupLocation.name }}
          </div>

          <PickupAvalablityInfo
            :availability-type="pickupLocation.availabilityType"
            :availability-note="pickupLocation.availabilityNote"
          />
        </div>
      </div>
    </div>
  </VcWidget>
</template>

<script setup lang="ts">
import type { ProductPickupLocation } from "@/core/api/graphql/types";
import PickupAvalablityInfo from "@/shared/common/components/pickup-availability-info.vue";

interface IProps {
  pickupLocations?: ProductPickupLocation[];
  loading: boolean;
}

defineProps<IProps>();
</script>

<style lang="scss">
.pickup-locations {
  @apply mt-7;

  &__group {
    @apply flex flex-row gap-x-3 items-start border rounded p-3;
  }

  &__group-header {
    @apply font-bold text-lg;
  }

  &__option {
    @apply my-3;
  }

  &__option-name {
    @apply font-bold text-sm;
  }
}
</style>
