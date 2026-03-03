<template>
  <VcScrollbar vertical class="select-address-map-list">
    <ul v-if="addresses.length" class="select-address-map-list__list" data-test-id="pickup-locations-list">
      <li
        v-for="address in addresses"
        :key="address.id"
        :data-address-id="address.id"
        :data-country="address.address?.countryName"
        :data-region="address.address?.regionId"
        :data-city="address.address?.city"
        :data-line1="address.address?.line1"
        :data-line2="address.address?.line2"
        :data-pickup-point-name="address.name"
        :data-coords="address.geoLocation"
        class="select-address-map-list__item"
        data-test-id="pickup-location-item"
      >
        <VcRadioButton
          :model-value="selectedAddressId"
          :value="address.id"
          :no-indicator="!selectable"
          class="select-address-map-list__radio-button"
          size="sm"
          :data-test-coords="address.geoLocation"
          @click="$emit('select', address)"
        >
          <div class="select-address-map-list__label" data-test-id="pickup-location-name">{{ address.name }}</div>

          <div class="select-address-map-list__address" data-test-id="pickup-location-address">
            {{ getAddressName(address) }}
          </div>

          <PickupAvailabilityInfo
            class="select-address-map-list__pickup-availability"
            :availability-type="address.availabilityType"
            :availability-note="address.availabilityNote"
          />
        </VcRadioButton>
      </li>
    </ul>

    <div v-else class="select-address-map-list__not-found" data-test-id="pickup-locations-not-found">
      <span>{{ $t("pages.account.order_details.bopis.cart_pickup_points_not_found_by_filter") }}</span>

      <VcButton prepend-icon="reset" data-test-id="reset-search-button" @click="$emit('resetFilter')">
        {{ $t("pages.account.order_details.bopis.cart_pickup_points_reset_search") }}
      </VcButton>
    </div>
  </VcScrollbar>
</template>

<script setup lang="ts">
import { getAddressName } from "@/core/utilities/address";
import type { PickupLocationType } from "@/shared/checkout/composables";
import PickupAvailabilityInfo from "@/shared/common/components/pickup-availability-info.vue";

interface IProps {
  addresses: PickupLocationType[];
  selectedAddressId?: string;
  selectable?: boolean;
}

interface IEmits {
  (event: "select", address: PickupLocationType): void;
  (event: "resetFilter"): void;
}

defineEmits<IEmits>();
withDefaults(defineProps<IProps>(), {
  selectable: true,
});
</script>

<style lang="scss">
.select-address-map-list {
  @apply w-full max-h-full;

  &__list {
    @apply flex flex-col gap-3;
  }

  &__item {
    @apply p-2.5 rounded-[--vc-radius] border border-neutral-400;

    &:has(:checked),
    &:hover {
      @apply bg-secondary-50;
    }
  }

  &__radio-button {
    @apply flex flex-col gap-0.5;
  }

  &__label {
    @apply mb-0.5 text-base/none font-bold;

    @media (min-width: theme("screens.md")) {
      @apply text-xs;
    }
  }

  &__address {
    @apply text-xs font-normal;
  }

  &__pickup-availability {
    @apply mt-0.5;
  }

  &__not-found {
    @apply flex flex-col gap-3 w-60;
  }
}
</style>
