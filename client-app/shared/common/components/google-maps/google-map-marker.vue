<template>
  <Teleport v-if="map && isInfoWindowOpen" defer :to="`#${ACTIVE_INFO_WINDOW_CONTENT_ID}`">
    <slot v-if="map" />
  </Teleport>
</template>

<script setup lang="ts">
import { onBeforeUnmount, shallowRef, toRefs, watch, ref, nextTick, useSlots } from "vue";
import { Logger } from "@/core/utilities";
import { useGoogleMaps } from "@/shared/common/composables/useGoogleMaps";

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  showInfo: true,
  pin: () => ({}),
});

const ACTIVE_INFO_WINDOW_CONTENT_ID = "active-info-window-content";

const { mapId } = toRefs(props);

const { addMarker, initInfoWindow, map, infoWindow, removeMarker } = useGoogleMaps(mapId.value);
const slots = useSlots();

interface IProps {
  position: google.maps.LatLngLiteral;
  title?: string;
  showInfo?: boolean;
  pin?: google.maps.marker.PinElementOptions;
  mapId: string;
}

interface IEmits {
  click: [];
}

let listener: google.maps.MapsEventListener | undefined;
let closeListener: google.maps.MapsEventListener | undefined;

const marker = shallowRef<google.maps.marker.AdvancedMarkerElement>();
const isInfoWindowOpen = ref(false);

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

async function openInfoWindow() {
  if (!slots.default) {
    return;
  }

  isInfoWindowOpen.value = false;

  infoWindow.value?.setContent(`<div id="${ACTIVE_INFO_WINDOW_CONTENT_ID}"></div>`);

  infoWindow.value?.open({
    anchor: marker.value,
    map: map.value,
  });

  await nextTick();
  isInfoWindowOpen.value = true;
}

function init() {
  createMarker();
  if (props.showInfo) {
    initInfoWindow();
  }

  listener = marker.value?.addListener("gmp-click", () => {
    emit("click");
    void openInfoWindow();
  });

  if (infoWindow.value) {
    closeListener = infoWindow.value.addListener("close", () => {
      isInfoWindowOpen.value = false;
    });
  }
}

const unwatch = watch(
  map,
  () => {
    if (map.value && !marker.value) {
      init();
      unwatch();
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  listener?.remove();
  closeListener?.remove();

  if (marker.value) {
    removeMarker(marker.value);
  }
});
</script>
