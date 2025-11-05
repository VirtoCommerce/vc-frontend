<template>
  <Teleport v-if="map && isInfoWindowOpen" defer :to="`#${ACTIVE_INFO_WINDOW_CONTENT_ID}`">
    <slot v-if="map" />
  </Teleport>
</template>

<script setup lang="ts">
import { onBeforeUnmount, shallowRef, toRefs, watch, ref, useSlots, computed } from "vue";
import { Logger } from "@/core/utilities";
import { useGoogleMaps } from "@/shared/common/composables/useGoogleMaps";

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  showInfo: true,
  pin: () => ({}),
});

const { mapId, isActive, pinOptions, activePinOptions } = toRefs(props);

const { addMarker, initInfoWindow, map, infoWindow, removeMarker } = useGoogleMaps(mapId.value);
const slots = useSlots();

interface IProps {
  position: google.maps.LatLngLiteral;
  title?: string;
  showInfo?: boolean;
  mapId: string;
  isActive?: boolean;
  pinOptions?: google.maps.marker.PinElementOptions;
  activePinOptions?: google.maps.marker.PinElementOptions;
}

interface IEmits {
  click: [];
}

const ACTIVE_INFO_WINDOW_CONTENT_ID = `active-info-window-content-${mapId.value}`;

let listener: google.maps.MapsEventListener | undefined;
let closeListener: google.maps.MapsEventListener | undefined;

const marker = shallowRef<google.maps.marker.AdvancedMarkerElement>();
const isInfoWindowOpen = ref(false);
const currentPinElement = shallowRef<google.maps.marker.PinElement | null>(null);

const activePin = computed(() => ({ ...pinOptions.value, ...activePinOptions.value }));

function createMarker() {
  if (!map.value || marker.value) {
    return;
  }

  currentPinElement.value = new google.maps.marker.PinElement(isActive.value ? activePin.value : pinOptions.value);

  try {
    marker.value = addMarker({
      map: map.value,
      position: props.position,
      title: props.title,
      content: currentPinElement.value.element,
    });
  } catch (error) {
    Logger.error("Failed to create AdvancedMarkerElement:", error);
  }
}

function openInfoWindow() {
  if (!slots.default) {
    return;
  }

  isInfoWindowOpen.value = false;

  infoWindow.value?.setContent(`<div id="${ACTIVE_INFO_WINDOW_CONTENT_ID}"></div>`);

  infoWindow.value?.open({
    anchor: marker.value,
    map: map.value,
  });

  isInfoWindowOpen.value = true;
}

function init() {
  createMarker();
  if (props.showInfo) {
    initInfoWindow();
  }

  listener = marker.value?.addListener("gmp-click", () => {
    emit("click");
    openInfoWindow();
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
  { immediate: false }, //Using nextTick instead of immediate: false causes the markers to lose reactivity and not render
);

watch(
  isActive,
  () => {
    if (currentPinElement.value) {
      currentPinElement.value.background = isActive.value ? activePin.value.background : pinOptions.value?.background;
      currentPinElement.value.borderColor = isActive.value
        ? activePin.value.borderColor
        : pinOptions.value?.borderColor;
      currentPinElement.value.glyph = isActive.value ? activePin.value.glyph : pinOptions.value?.glyph;
      currentPinElement.value.scale = isActive.value ? activePin.value.scale : pinOptions.value?.scale;
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
