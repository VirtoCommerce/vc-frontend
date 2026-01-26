<template>
  <GoogleMap
    :api-key="apiKey"
    :map-id="MAP_ID"
    :options="{ disableDefaultUI: true }"
    class="select-address-map-view"
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
          @click="$emit('select', address)"
        />
      </template>
    </GoogleMapMarkerClusterer>
  </GoogleMap>
</template>

<script setup lang="ts">
import { computed, toRef } from "vue";
import { geoLocationStringToLatLng } from "@/core/utilities/geo";
import { Logger } from "@/core/utilities/logger";
import cubeIcon from "@/ui-kit/icons/cube.svg?raw";
import { getColorValue } from "@/ui-kit/utilities/css";
import type { PickupLocationType } from "@/shared/checkout/composables";
import GoogleMapMarkerClusterer from "@/shared/common/components/google-maps/google-map-marker-clusterer.vue";
import GoogleMapMarker from "@/shared/common/components/google-maps/google-map-marker.vue";
import GoogleMap from "@/shared/common/components/google-maps/google-map.vue";

interface IProps {
  apiKey: string;
  addresses: PickupLocationType[];
  selectedAddressId?: string;
}

interface IEmits {
  (event: "select", address: PickupLocationType): void;
}

defineEmits<IEmits>();
const props = defineProps<IProps>();

const MAP_ID = "select-bopis-map-modal";

const addresses = toRef(props, "addresses");
const addressesKey = computed(() => addresses.value.map((a) => a.id).join("-"));

// Pin styling
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

function getLatLng(location: string | undefined) {
  try {
    return geoLocationStringToLatLng(location);
  } catch (error) {
    Logger.warn("Failed to parse geo location", error);
    return null;
  }
}
</script>

<style lang="scss">
.select-address-map-view {
  @apply grow w-full h-full;
}
</style>
