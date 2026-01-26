<template>
  <div v-if="addresses.length || filterIsApplied" class="select-address-map-desktop">
    <SelectAddressFilter @applyFilter="applyFilter" />

    <div class="select-address-map-desktop__content">
      <VcLoaderOverlay v-if="pickupLocationsLoading" />

      <div class="select-address-map-desktop__sidebar">
        <SelectAddressMapList
          :addresses="addresses"
          :selected-address-id="selectedAddressId"
          class="select-address-map-desktop__list"
          @select="onListSelect"
          @reset-filter="resetFilter"
        />
      </div>

      <div class="select-address-map-desktop__map-wrapper">
        <SelectAddressMapView
          :api-key="apiKey"
          :addresses="addresses"
          :selected-address-id="selectedAddressId"
          class="select-address-map-desktop__map"
          @select="onMapSelect"
        />

        <Transition name="slide">
          <PickupLocationInfoCard
            v-if="infoCardLocation"
            :location="infoCardLocation"
            :class="['select-address-map-desktop__card', { 'select-address-map-desktop__card--pulse': isPulsing }]"
            @close="closeInfoCard"
            @select="onCardSelect"
          />
        </Transition>
      </div>
    </div>
  </div>

  <div v-else>{{ $t("pages.account.order_details.bopis.cart_pickup_points_not_found") }}</div>
</template>

<script setup lang="ts">
import { toRef } from "vue";
import { SelectAddressFilter } from "@/shared/checkout";
import { useSelectAddressMap } from "@/shared/checkout/composables";
import { useModal } from "@/shared/modal";
import PickupLocationInfoCard from "../pickup-location-info-card.vue";
import SelectAddressMapList from "./select-address-map-list.vue";
import SelectAddressMapView from "./select-address-map-view.vue";
import type { PickupLocationType } from "@/shared/checkout/composables";

interface IProps {
  addresses?: PickupLocationType[];
  apiKey: string;
  currentAddress?: { id: string };
}

interface IEmits {
  (event: "result", value: string): void;
  (event: "filterChange"): void;
}

const emit = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  addresses: () => [],
});
const { closeModal } = useModal();

const {
  selectedAddressId,
  infoCardLocation,
  isPulsing,
  filterIsApplied,
  pickupLocationsLoading,
  closeInfoCard,
  selectAddress,
  applyFilter,
  resetFilter,
} = useSelectAddressMap({
  addresses: toRef(props, "addresses"),
  currentAddress: toRef(props, "currentAddress"),
  onFilterChange: () => emit("filterChange"),
});

function onListSelect(address: PickupLocationType) {
  selectAddress(address, { scrollToSelectedOnMap: true, openInfo: true });
}

function onMapSelect(address: PickupLocationType) {
  selectAddress(address, { scrollToSelectedOnList: true, openInfo: true });
}

function onCardSelect(locationId: string) {
  emit("result", locationId);
  closeModal();
}
</script>

<style lang="scss">
.select-address-map-desktop {
  @apply px-6 h-full max-h-full;

  &__content {
    @apply relative flex flex-row gap-3 w-full flex-1 max-h-[90%];
  }

  &__sidebar {
    @apply relative shrink-0 max-h-full w-60 order-first;
  }

  &__list {
    @apply pe-2.5;
  }

  &__map-wrapper {
    @apply overflow-clip relative grow;
  }

  &__map {
    @apply h-full;
  }

  &__card {
    @apply absolute inset-y-3 left-3 w-60;

    &--pulse {
      animation: pulse-scale 0.2s ease-out;
    }
  }

  // Slide animation for info card
  .slide-enter-active {
    @apply transition-transform duration-300 ease-out;
  }

  .slide-leave-active {
    @apply transition-transform duration-300 ease-in;
  }

  .slide-enter-from,
  .slide-leave-to {
    @apply -translate-x-full;
  }

  @keyframes pulse-scale {
    0% {
      transform: scale(0.97);
      opacity: 0.7;
    }

    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
}
</style>
