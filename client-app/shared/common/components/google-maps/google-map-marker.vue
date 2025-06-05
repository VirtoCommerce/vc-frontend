<template>
  <slot v-if="map" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, shallowRef, watch } from "vue";
import { Logger } from "@/core/utilities";
import { useGoogleMaps } from "@/shared/common/composables/useGoogleMaps";

const emit = defineEmits<IEmits>();

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

interface IEmits {
  click: [];
}

let listener: google.maps.MapsEventListener | undefined;

const marker = shallowRef<google.maps.marker.AdvancedMarkerElement>();
const isInitialized = ref(false);

function createMarker() {
  if (!map.value || marker.value) {
    return;
  }

  const customPin = new google.maps.marker.PinElement(props.pin);

  try {
    marker.value = addMarker({
      map: map.value,
      position: props.position,
      title: props.title,
      content: customPin.element,
    });
  } catch (error) {
    Logger.error("Failed to create AdvancedMarkerElement:", error);
  }
}

function init() {
  createMarker();
  if (props.showInfo) {
    initInfoWindow();
  }
  listener = marker.value?.addListener("gmp-click", () => {
    emit("click");
    if (!props.infoContent) {
      return;
    }
    infoWindow.value?.setContent(props.infoContent);
    infoWindow.value?.open({
      anchor: marker.value,
      map: map.value,
    });
  });
}

const unwatch = watch(
  map,
  () => {
    if (map.value && !isInitialized.value) {
      init();
      isInitialized.value = true;
      unwatch();
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  listener?.remove();
});
</script>
