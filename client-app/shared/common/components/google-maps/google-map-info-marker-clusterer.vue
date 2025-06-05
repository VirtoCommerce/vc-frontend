<template>
  <slot />
</template>

<script setup lang="ts">
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { watch } from "vue";
import { Logger } from "@/core/utilities";
import { useGoogleMaps } from "@/shared/common/composables/useGoogleMaps";

const { map, markers } = useGoogleMaps();

let markerClusterer: MarkerClusterer | undefined;

function createMarkerClusterer() {
  if (!map.value) {
    return;
  }

  try {
    markerClusterer = new MarkerClusterer({
      map: map.value,
      markers: markers.value,
    });
  } catch (error) {
    Logger.error("Failed to create MarkerClusterer:", error);
  }
}

const unwatch = watch(
  map,
  () => {
    if (map.value) {
      createMarkerClusterer();
      unwatch();
    }
  },
  { immediate: true },
);

watch(
  markers,
  () => {
    if (markers.value && markers.value.length > 0 && markerClusterer) {
      markerClusterer.clearMarkers();
      markerClusterer.addMarkers(markers.value);
    }
  },
  { immediate: true },
);
</script>
