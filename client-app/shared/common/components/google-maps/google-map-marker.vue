<template>
  <slot v-if="map" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, shallowRef, watch } from "vue";
import { Logger } from "@/core/utilities";
import { useGoogleMaps } from "@/shared/common/composables/useGoogleMaps";

const props = withDefaults(defineProps<IProps>(), {
  showInfo: true,
});

const { addMarker, initInfoWindow, map, infoWindow } = useGoogleMaps();

interface IProps {
  position: google.maps.LatLngLiteral;
  title?: string;
  content?: string;
  showInfo?: boolean;
}

let listener: google.maps.MapsEventListener | undefined;

const marker = shallowRef<google.maps.marker.AdvancedMarkerElement>();

function createMarker() {
  if (!map.value || marker.value) {
    return;
  }

  try {
    marker.value = addMarker({
      map: map.value,
      position: props.position,
      title: props.title,
    });
  } catch (error) {
    Logger.error("Failed to create AdvancedMarkerElement:", error);
  }
}

function init() {
  if (map.value) {
    createMarker();
    if (!props.showInfo) {
      return;
    }
    initInfoWindow();
    listener = marker.value?.addListener("gmp-click", () => {
      infoWindow.value?.setContent(props.content);
      infoWindow.value?.open({
        anchor: marker.value,
        map: map.value,
      });
    });
  }
}

const unwatch = watch(
  map,
  () => {
    if (map.value) {
      init();
      unwatch();
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  listener?.remove();
});
</script>
