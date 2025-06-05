<template>
  <slot v-if="map" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, shallowRef, watch } from "vue";
import { Logger } from "@/core/utilities";
import { useGoogleMaps } from "@/shared/common/composables/useGoogleMaps";

const props = withDefaults(defineProps<IProps>(), {
  showInfo: true,
  pin: () => ({}),
});

const { addMarker, initInfoWindow, map, infoWindow } = useGoogleMaps();

interface IProps {
  position: google.maps.LatLngLiteral;
  title?: string;
  infoContent?: string;
  showInfo?: boolean;
  pin?: google.maps.marker.PinElementOptions;
}

let listener: google.maps.MapsEventListener | undefined;

const marker = shallowRef<google.maps.marker.AdvancedMarkerElement>();

function createMarker() {
  if (!map.value || marker.value) {
    return;
  }

  const customMarker = new google.maps.marker.PinElement(props.pin);

  try {
    marker.value = addMarker({
      map: map.value,
      position: props.position,
      title: props.title,
      content: customMarker.element,
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
      infoWindow.value?.setContent(props.infoContent);
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
