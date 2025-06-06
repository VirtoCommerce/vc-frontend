<template>
  <VcModal
    :title="$t('shared.checkout.select_bopis_modal.title')"
    max-width="60rem"
    is-mobile-fullscreen
    class="select-address-map-modal"
  >
    <div class="select-address-map-modal__content">
      <div class="select-address-map-modal__sidebar">
        <ul class="select-address-map-modal__list">
          <li v-for="address in addresses" :key="address.id">
            <VcRadioButton
              v-model="selectedAddressId"
              :value="address.id"
              :label="getAddressLabel(address)"
              @change="selectHandler(address, { scrollToSelected: true })"
            />
          </li>
        </ul>
      </div>

      <div class="select-address-map-modal__map">
        <GoogleMap :api-key="apiKey" :map-id="MAP_ID" :options="{ disableDefaultUI: true }">
          <GoogleMapMarkerClusterer :map-id="MAP_ID">
            <template v-for="address in addresses" :key="address.id">
              <GoogleMapMarker
                v-if="getLatLng(address.geoLocation)"
                :map-id="MAP_ID"
                :position="getLatLng(address.geoLocation)!"
              >
                {{ address.description }}

                <VcButton @click="selectHandler(address, { closeInfo: true })">Test test</VcButton>
              </GoogleMapMarker>
            </template>
          </GoogleMapMarkerClusterer>
        </GoogleMap>
      </div>
    </div>
    <template #actions="{ close }">
      <div class="flex w-full flex-wrap items-center">
        <VcButton @click="close">
          {{ $t("common.buttons.cancel") }}
        </VcButton>
      </div>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { ref, toRef, watch } from "vue";
import { getAddressName } from "@/core/utilities/address";
import { geoLocationStringToLatLng } from "@/core/utilities/geo";
import { Logger } from "@/core/utilities/logger";
import { useGoogleMaps } from "@/shared/common/composables/useGoogleMaps";
import type { GetPickupLocationsQuery } from "@/core/api/graphql/types";
import type { AnyAddressType } from "@/core/types";
import GoogleMapMarkerClusterer from "@/shared/common/components/google-maps/google-map-marker-clusterer.vue";
import GoogleMapMarker from "@/shared/common/components/google-maps/google-map-marker.vue";
import GoogleMap from "@/shared/common/components/google-maps/google-map.vue";

type PickupLocationType = NonNullable<NonNullable<GetPickupLocationsQuery["pickupLocations"]>["items"]>[number];

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  addresses: () => [],
});

const addresses = toRef(props, "addresses");
const selectedAddressId = ref<string | undefined>();

const MAP_ID = "select-bopis-map-modal";

const { zoomToMarkers, markers, zoomToLatLng, closeInfoWindow } = useGoogleMaps(MAP_ID);

interface IProps {
  addresses?: PickupLocationType[];
  apiKey: string;
}

interface IEmits {
  (event: "result", value: AnyAddressType): void;
  (event: "addNewAddress"): void;
}

function getLatLng(location: string | undefined) {
  try {
    return geoLocationStringToLatLng(location);
  } catch (error) {
    Logger.warn("Failed to parse geo location", error);
    return null;
  }
}

function selectHandler(address: PickupLocationType, options: { scrollToSelected?: boolean; closeInfo?: boolean } = {}) {
  if (address.id) {
    selectedAddressId.value = address.id;
  }

  if (options.scrollToSelected) {
    const latLng = getLatLng(address.geoLocation);

    if (latLng) {
      zoomToLatLng(latLng);
    }
  }

  if (options.closeInfo) {
    closeInfoWindow();
  }
}

function getAddressLabel(address: PickupLocationType) {
  return `${address.name} ${getAddressName(address)}`;
}

watch(
  markers,
  (newMarkers) => {
    if (newMarkers.length > 0) {
      zoomToMarkers();
    }
  },
  {
    immediate: true,
  },
);
</script>

<style lang="scss">
.select-address-map-modal {
  &__content {
    @apply relative h-[400px] max-h-screen w-full flex flex-col lg:h-[523px] lg:flex-row gap-5;
  }

  &__map {
    @apply size-full lg:order-1 rounded-lg overflow-hidden;
  }

  &__sidebar {
    @apply min-w-56;
  }
}
</style>
