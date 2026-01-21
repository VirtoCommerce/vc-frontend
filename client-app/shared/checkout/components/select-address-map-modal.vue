<template>
  <VcModal
    :title="$t('shared.checkout.select_bopis_modal.title')"
    max-width="73rem"
    is-mobile-fullscreen
    :scrollable="false"
    hide-actions
    class="select-address-map-modal"
  >
    <div v-if="addresses.length || filterIsApplied" class="select-address-map-modal__container">
      <SelectAddressFilter @applyFilter="applyFilter" />

      <div class="select-address-map-modal__content">
        <VcLoaderOverlay v-if="pickupLocationsLoading" />

        <GoogleMap
          :api-key="apiKey"
          :map-id="MAP_ID"
          :options="{ disableDefaultUI: true }"
          class="select-address-map-modal__map"
          :key="addressesKey"
        >
          <GoogleMapMarkerClusterer :map-id="MAP_ID">
            <template v-for="address in addresses" :key="address.id">
              <GoogleMapMarker
                v-if="getLatLng(address.geoLocation)"
                :map-id="MAP_ID"
                :position="getLatLng(address.geoLocation)!"
                :pin-options="createPin()"
                :title="address.name"
                :is-active="selectedAddressId === address.id"
                :active-pin-options="activePinOptions"
                @click="selectHandler(address, { scrollToSelectedOnList: true, openInfo: true })"
              />
            </template>
          </GoogleMapMarkerClusterer>
        </GoogleMap>

        <div class="select-address-map-modal__sidebar">
          <VcScrollbar
            vertical
            :class="[
              'select-address-map-modal__scroll',
              { 'select-address-map-modal__scroll--hidden': infoCardLocation },
            ]"
          >
            <ul v-if="addresses.length" class="select-address-map-modal__list" data-test-id="pickup-locations-list">
              <li
                v-for="address in addresses"
                :key="address.id"
                :data-address-id="address.id"
                :data-country="address.address?.countryName"
                :data-region="address.address?.regionId"
                :data-city="address.address?.city"
                class="select-address-map-modal__list-item"
              >
                <VcRadioButton
                  v-model="selectedAddressId"
                  :value="address.id"
                  class="select-address-map-modal__radio-button"
                  size="sm"
                  @click="selectHandler(address, { scrollToSelectedOnMap: true, openInfo: true })"
                  :data-test-coords="address.geoLocation"
                >
                  <VcLabel size="xs">{{ address.name }}</VcLabel>

                  <p class="select-address-map-modal__radio-button-address">{{ getAddressName(address) }}</p>

                  <PickupAvailabilityInfo
                    class="select-address-map-modal__radio-button-pickup-availability"
                    :availability-type="address.availabilityType"
                    :availability-note="address.availabilityNote"
                  />
                </VcRadioButton>
              </li>
            </ul>

            <div v-else class="select-address-map-modal__not-found">
              <span>{{ $t("pages.account.order_details.bopis.cart_pickup_points_not_found_by_filter") }}</span>

              <VcButton prepend-icon="reset" @click="resetFilter">
                {{ $t("pages.account.order_details.bopis.cart_pickup_points_reset_search") }}
              </VcButton>
            </div>
          </VcScrollbar>

          <Transition name="slide">
            <PickupLocationInfoCard
              v-if="infoCardLocation"
              :location="infoCardLocation"
              :class="['select-address-map-modal__card', { 'select-address-map-modal__card--pulse': isPulsing }]"
              @close="closeInfoCard"
              @select="selectFromInfoCard"
            />
          </Transition>
        </div>
      </div>
    </div>

    <div v-else>{{ $t("pages.account.order_details.bopis.cart_pickup_points_not_found") }}</div>
  </VcModal>
</template>

<script setup lang="ts">
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";
import { computed, ref, toRef, watch } from "vue";
import { getAddressName } from "@/core/utilities/address";
import { geoLocationStringToLatLng } from "@/core/utilities/geo";
import { Logger } from "@/core/utilities/logger";
import { useCartPickupLocations } from "@/shared/cart";
import { SelectAddressFilter } from "@/shared/checkout";
import { useGoogleMaps } from "@/shared/common/composables/useGoogleMaps";
import { useModal } from "@/shared/modal";
import cubeIcon from "@/ui-kit/icons/cube.svg?raw";
import { getColorValue } from "@/ui-kit/utilities/css";
import PickupLocationInfoCard from "./pickup-location-info-card.vue";
import type { GetCartPickupLocationsQuery } from "@/core/api/graphql/types";
import GoogleMapMarkerClusterer from "@/shared/common/components/google-maps/google-map-marker-clusterer.vue";
import GoogleMapMarker from "@/shared/common/components/google-maps/google-map-marker.vue";
import GoogleMap from "@/shared/common/components/google-maps/google-map.vue";
import PickupAvailabilityInfo from "@/shared/common/components/pickup-availability-info.vue";

type PickupLocationType = NonNullable<NonNullable<GetCartPickupLocationsQuery["cartPickupLocations"]>["items"]>[number];

const emit = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  addresses: () => [],
});
const { closeModal } = useModal();
const addresses = toRef(props, "addresses");
const addressesKey = computed(() => addresses.value.map((a) => a.id).join("-"));
const currentAddress = toRef(props, "currentAddress");
const selectedAddressId = ref<string | undefined>(currentAddress.value?.id);
const infoCardLocation = ref<PickupLocationType | undefined>(undefined);
const isPulsing = ref(false);

const MAP_ID = "select-bopis-map-modal";

const { zoomToMarkers, markers, zoomToLatLng, onceIdle, map } = useGoogleMaps(MAP_ID);

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");

interface IProps {
  addresses?: PickupLocationType[];
  apiKey: string;
  currentAddress?: { id: string };
}

interface IEmits {
  (event: "result", value: string): void;
  (event: "filterChange"): void;
}

const pinColor = getColorValue("primary");
const parser = new DOMParser();
const cube = parser.parseFromString(cubeIcon, "image/svg+xml").documentElement;
cube.classList.add("select-address-map-modal__marker-glyph");

function cloneElement<T extends Element>(el: T): T {
  return el.cloneNode(true) as T;
}

const activePinOptions = {
  background: getColorValue("success"),
  borderColor: getColorValue("success"),
  scale: 1.7,
};

function createPin() {
  return {
    background: pinColor,
    borderColor: pinColor,
    glyph: cloneElement(cube),
    scale: 1.5,
  };
}

const { filterIsApplied, clearFilter, pickupLocationsLoading } = useCartPickupLocations();

function applyFilter() {
  filterIsApplied.value = true;
  emit("filterChange");
}

function resetFilter() {
  clearFilter();
  applyFilter();
}

function getLatLng(location: string | undefined) {
  try {
    return geoLocationStringToLatLng(location);
  } catch (error) {
    Logger.warn("Failed to parse geo location", error);
    return null;
  }
}

function showLocationInfoCard(address: PickupLocationType) {
  // Trigger pulse animation if card is already visible
  if (infoCardLocation.value && infoCardLocation.value.id !== address.id) {
    isPulsing.value = true;
    setTimeout(() => {
      isPulsing.value = false;
    }, 200);
  }
  infoCardLocation.value = address;
  if (address.id) {
    selectedAddressId.value = address.id;
  }
}

function closeInfoCard() {
  infoCardLocation.value = undefined;
}

function selectFromInfoCard() {
  if (infoCardLocation.value?.id) {
    emit("result", infoCardLocation.value.id);
    closeModal();
  }
}

function selectHandler(
  address: PickupLocationType,
  options: {
    scrollToSelectedOnMap?: boolean;
    scrollToSelectedOnList?: boolean;
    openInfo?: boolean;
  } = {},
) {
  if (address.id) {
    selectedAddressId.value = address.id;
  }

  if (options.scrollToSelectedOnMap) {
    const latLng = getLatLng(address.geoLocation);

    if (latLng) {
      zoomToLatLng(latLng, 17);

      if (options.openInfo) {
        onceIdle(() => showLocationInfoCard(address));
      }
    }
  } else if (options.openInfo) {
    showLocationInfoCard(address);
  }

  if (options.scrollToSelectedOnList && !isMobile.value && address.id) {
    const listElement = document.querySelector(`[data-address-id="${CSS.escape(address.id)}"]`);

    if (listElement) {
      listElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
}

watch(
  markers,
  (newMarkers) => {
    if (newMarkers.length > 0 && !selectedAddressId.value) {
      zoomToMarkers();
    }
    if (selectedAddressId.value) {
      const address = addresses.value.find(({ id }) => id === selectedAddressId.value);
      if (!address) {
        zoomToMarkers();
      } else if (address.geoLocation) {
        const latLng = getLatLng(address.geoLocation);
        if (latLng) {
          zoomToLatLng(latLng);
        }
      }
    }
  },
  {
    immediate: true,
  },
);

const unwatch = watch([map, currentAddress], ([newMap, newCurrentAddress]) => {
  if (newMap && newCurrentAddress?.id) {
    const address = addresses.value.find(({ id }) => id === newCurrentAddress.id);

    if (address && address.geoLocation) {
      const latLng = getLatLng(address.geoLocation);
      if (latLng) {
        zoomToLatLng(latLng);
      }
    }

    unwatch();
  }
});
</script>

<style lang="scss">
.select-address-map-modal {
  &__container {
    @apply h-full max-h-full;
  }

  &__content {
    @apply relative flex flex-col gap-3 w-full flex-1 max-h-[90%];

    @media (min-width: theme("screens.md")) {
      @apply flex-row;
    }
  }

  &__map {
    @apply grow w-full;

    @media (min-width: theme("screens.md")) {
      @apply h-auto ps-0;
    }
  }

  &__sidebar {
    @apply relative shrink-0 max-h-[40%];

    @media (min-width: theme("screens.md")) {
      @apply order-first max-h-full w-60;
    }
  }

  &__scroll {
    @apply w-full max-h-full pe-2.5 transition-opacity duration-300;

    &--hidden {
      @apply opacity-0 pointer-events-none;
    }
  }

  &__list {
    @apply flex flex-col gap-3;
  }

  &__list-item {
    @apply p-2.5 rounded-[--vc-radius] border border-neutral-400;

    &:has(:checked) {
      @apply bg-secondary-50;
    }
  }

  &__radio-button {
    @apply flex flex-col gap-0.5;
  }

  &__radio-button-address {
    @apply text-xs font-normal;
  }

  &__radio-button-pickup-availability {
    @apply mt-0.5;
  }

  &__not-found {
    @apply flex flex-col gap-3 w-60;
  }

  &__actions {
    @apply flex gap-4 justify-end w-full;

    @media (min-width: theme("screens.md")) {
      @apply justify-between;
    }
  }

  &__marker-glyph {
    @apply fill-additional-50 size-6;
  }

  &__card {
    @apply absolute inset-0;

    &--pulse {
      animation: pulse-scale 0.2s ease-out;
    }
  }

  // Slide animation for info card (appear / close)
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
