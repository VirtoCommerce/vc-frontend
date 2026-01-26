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
      >
        <VcRadioButton
          :model-value="selectedAddressId"
          :value="address.id"
          class="select-address-map-list__radio-button"
          size="sm"
          :data-test-coords="address.geoLocation"
          @click="$emit('select', address)"
        >
          <VcLabel size="xs">{{ address.name }}</VcLabel>

          <p class="select-address-map-list__address">{{ getAddressName(address) }}</p>

          <PickupAvailabilityInfo
            class="select-address-map-list__pickup-availability"
            :availability-type="address.availabilityType"
            :availability-note="address.availabilityNote"
          />
        </VcRadioButton>
      </li>
    </ul>

    <div v-else class="select-address-map-list__not-found">
      <span>{{ $t("pages.account.order_details.bopis.cart_pickup_points_not_found_by_filter") }}</span>

      <VcButton prepend-icon="reset" @click="$emit('resetFilter')">
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
}

interface IEmits {
  (event: "select", address: PickupLocationType): void;
  (event: "resetFilter"): void;
}

defineEmits<IEmits>();
defineProps<IProps>();
</script>

<style lang="scss">
.select-address-map-list {
  @apply w-full max-h-full;

  &__list {
    @apply flex flex-col gap-3;
  }

  &__item {
    @apply p-2.5 rounded-[--vc-radius] border border-neutral-400;

    &:has(:checked) {
      @apply bg-secondary-50;
    }
  }

  &__radio-button {
    @apply flex flex-col gap-0.5;
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
