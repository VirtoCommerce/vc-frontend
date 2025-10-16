<template>
  <slot />
</template>

<script setup lang="ts">
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { onBeforeUnmount, toRefs, watch, nextTick } from "vue";
import { Logger } from "@/core/utilities";
import { useGoogleMaps } from "@/shared/common/composables/useGoogleMaps";
import type { MarkerClustererOptions } from "@googlemaps/markerclusterer";

interface IProps {
  options?: Omit<MarkerClustererOptions, "map" | "markers" | "onClusterClick">;
  mapId: string;
}

const props = withDefaults(defineProps<IProps>(), {
  options: () => ({}),
});

const { mapId } = toRefs(props);

const { map, markers } = useGoogleMaps(mapId.value);

let markerClusterer: MarkerClusterer | undefined;

function createMarkerClusterer() {
  if (!map.value) {
    return;
  }

  try {
    markerClusterer = new MarkerClusterer({
      map: map.value,
      markers: markers.value,
      ...props.options,
    });
  } catch (error) {
    Logger.error("Failed to create MarkerClusterer:", error);
  }
}

const unwatch = watch(
  map,
  async () => {
    if (map.value) {
      createMarkerClusterer();
      await nextTick();
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

onBeforeUnmount(() => {
  if (markerClusterer) {
    markerClusterer.clearMarkers();
  }
});
</script>
