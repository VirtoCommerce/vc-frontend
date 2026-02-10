<template>
  <VcWidget :title="$t('shared.catalog.shipment_options.title')" class="product-pickup-locations">
    <VcLoaderOverlay v-if="loading" />

    <div class="product-pickup-locations__group">
      <VcImage
        src="in-store-pickup.svg"
        :alt="$t('shared.catalog.shipment_options.in_store')"
        class="product-pickup-locations__img"
      />

      <div class="product-pickup-locations__content">
        <div class="product-pickup-locations__header">
          {{ $t("shared.catalog.shipment_options.in_store") }}
        </div>

        <div
          v-for="pickupLocation in pickupLocations"
          :key="pickupLocation.id"
          class="product-pickup-locations__option"
        >
          <div class="product-pickup-locations__name">
            {{ pickupLocation.name }}
          </div>

          <PickupAvailabilityInfo
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
import PickupAvailabilityInfo from "@/shared/common/components/pickup-availability-info.vue";

interface IProps {
  pickupLocations?: ProductPickupLocation[];
  loading: boolean;
}

defineProps<IProps>();
</script>

<style lang="scss">
.product-pickup-locations {
  &__group {
    @apply flex flex-row gap-x-3 items-start border rounded p-3;
  }

  &__content {
    @apply min-w-0;
  }

  &__header {
    @apply font-bold text-lg;

    word-break: break-word;
  }

  &__option {
    @apply my-3;
  }

  &__name {
    @apply font-bold text-sm;

    word-break: break-word;
  }
}
</style>
