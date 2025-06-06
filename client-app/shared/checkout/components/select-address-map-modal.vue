<template>
  <VcModal :title="$t('shared.checkout.select_bopis_modal.title')" max-width="60rem" is-mobile-fullscreen>
    <div class="relative h-[400px] w-full">
      <GoogleMap :api-key="apiKey" :map-id="MAP_ID" :options="{ disableDefaultUI: true }">
        <GoogleMapMarkerClusterer :map-id="MAP_ID">
          <template v-for="address in addresses" :key="address.id">
            <GoogleMapMarker
              v-if="getLatLng(address.geoLocation)"
              :map-id="MAP_ID"
              :position="getLatLng(address.geoLocation)!"
            >
              {{ address.description }}
            </GoogleMapMarker>
          </template>
        </GoogleMapMarkerClusterer>
      </GoogleMap>
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
import { toRef, watch } from "vue";
import { geoLocationStringToLatLng } from "@/core/utilities/geo";
import { Logger } from "@/core/utilities/logger";
import { useGoogleMaps } from "@/shared/common/composables/useGoogleMaps";
import type { GetPickupLocationsQuery } from "@/core/api/graphql/types";
import type { AnyAddressType } from "@/core/types";
import GoogleMapMarkerClusterer from "@/shared/common/components/google-maps/google-map-marker-clusterer.vue";
import GoogleMapMarker from "@/shared/common/components/google-maps/google-map-marker.vue";
import GoogleMap from "@/shared/common/components/google-maps/google-map.vue";

defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  addresses: () => [],
});

const addresses = toRef(props, "addresses");

const MAP_ID = "select-bopis-map-modal";

const { zoomToMarkers, markers } = useGoogleMaps(MAP_ID);

interface IProps {
  addresses?: NonNullable<GetPickupLocationsQuery["pickupLocations"]>["items"];
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
