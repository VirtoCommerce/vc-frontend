<template>
  <slot />
</template>

<script setup lang="ts">
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { watch } from "vue";
import { Logger } from "@/core/utilities";
import { useGoogleMaps } from "@/shared/common/composables/useGoogleMaps";

const { map, markers } = useGoogleMaps();

function createMarkerClusterer() {
  if (!map.value) {
    return;
  }

  try {
    new MarkerClusterer({
      map: map.value,
      markers: markers.value,
    });
  } catch (error) {
    Logger.error("Failed to create MarkerClusterer:", error);
  }
}

watch(
  markers,
  () => {
    if (markers.value && markers.value.length > 0) {
      createMarkerClusterer();
    }
  },
  { immediate: true },
);
</script>
