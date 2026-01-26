<template>
  <div class="select-address-map-mobile">
    <template v-if="addresses.length || filterIsApplied">
      <div class="select-address-map-mobile__container">
        <SelectAddressFilter class="select-address-map-mobile__filter" @applyFilter="applyFilter" />
      </div>

      <div class="select-address-map-mobile__content">
        <VcLoaderOverlay v-if="pickupLocationsLoading" />

        <SelectAddressMapList
          v-show="activeView === 'list'"
          :addresses="addresses"
          :selected-address-id="selectedAddressId"
          class="select-address-map-mobile__list"
          @select="onSelect"
          @reset-filter="resetFilter"
        />

        <SelectAddressMapView
          v-show="activeView === 'map'"
          :api-key="apiKey"
          :addresses="addresses"
          :selected-address-id="selectedAddressId"
          class="select-address-map-mobile__map"
          @select="onSelect"
        />
      </div>

      <div class="select-address-map-mobile__actions">
        <VcButton v-if="activeView === 'map'" prepend-icon="list" size="sm" @click="activeView = 'list'">
          {{ $t("shared.checkout.select_bopis_modal.view_list") }}
        </VcButton>

        <VcButton v-else prepend-icon="map" size="sm" @click="activeView = 'map'">
          {{ $t("shared.checkout.select_bopis_modal.view_map") }}
        </VcButton>
      </div>

      <!-- Info card with slide-up animation -->
      <div v-if="selectedLocation" class="select-address-map-mobile__info-card">
        <Transition name="slide-up" @after-leave="selectedLocation = undefined">
          <PickupLocationInfoCard
            v-if="isInfoCardVisible"
            :location="selectedLocation"
            @select="onCardSelect"
            @close="isInfoCardVisible = false"
          />
        </Transition>
      </div>
    </template>

    <div v-else class="select-address-map-mobile__not-found">
      {{ $t("pages.account.order_details.bopis.cart_pickup_points_not_found") }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, toRef } from "vue";
import { SelectAddressFilter } from "@/shared/checkout";
import { useSelectAddressMap } from "@/shared/checkout/composables";
import { useModal } from "@/shared/modal";
import PickupLocationInfoCard from "../pickup-location-info-card.vue";
import SelectAddressMapList from "./select-address-map-list.vue";
import SelectAddressMapView from "./select-address-map-view.vue";
import type { PickupLocationType } from "@/shared/checkout/composables";

type ViewModeType = "list" | "map";

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
const activeView = ref<ViewModeType>("list");
const selectedLocation = ref<PickupLocationType>();
const isInfoCardVisible = ref(false);

const { selectedAddressId, filterIsApplied, pickupLocationsLoading, selectAddress, applyFilter, resetFilter } =
  useSelectAddressMap({
    addresses: toRef(props, "addresses"),
    currentAddress: toRef(props, "currentAddress"),
    onFilterChange: () => emit("filterChange"),
  });

function onSelect(address: PickupLocationType) {
  selectAddress(address, { scrollToSelectedOnMap: true });
  selectedLocation.value = address;
  void nextTick(() => {
    isInfoCardVisible.value = true;
  });
}

function onCardSelect(locationId: string) {
  emit("result", locationId);
  closeModal();
}
</script>

<style lang="scss">
.select-address-map-mobile {
  @apply flex flex-col h-full max-h-full;

  &__container {
    @apply flex flex-col px-6 min-h-0;
  }

  &__content {
    @apply relative flex-1 px-5 min-h-0;
  }

  &__list {
    @apply h-full px-1 pb-3;
  }

  &__map {
    @apply h-full;
  }

  &__actions {
    @apply flex px-6 py-4 border-t;
  }

  &__info-card {
    @apply absolute inset-0 z-10;

    .slide-up-enter-active,
    .slide-up-leave-active {
      @apply transition-transform duration-300;
    }

    .slide-up-enter-from,
    .slide-up-leave-to {
      @apply translate-y-full;
    }
  }
}
</style>
