<template>
  <div class="google-map">
    <div :id="mapElementId" ref="mapContainer" class="google-map__container"></div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import uniqueId from "lodash/uniqueId";
import { computed, onBeforeUnmount, onMounted, ref, toRefs } from "vue";
import { useGoogleMaps } from "@/shared/common/composables/useGoogleMaps";

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  center: () => ({ lat: 0, lng: 0 }),
  zoom: 10,
});

const MAP_ELEMENT_ID_PREFIX = "google-map-";

interface IProps {
  apiKey: string;
  elementId?: string;
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  options?: Omit<google.maps.MapOptions, "center" | "zoom" | "mapId">;
  listenToBounds?: boolean;
  mapId: string;
}

interface IEmits {
  boundariesChanged: [boundaries: google.maps.LatLngBounds];
}

let listener: google.maps.MapsEventListener | undefined;

const { apiKey, center, zoom, elementId, mapId } = toRefs(props);
const mapElementId = computed(() => (elementId.value ? elementId.value : uniqueId(MAP_ELEMENT_ID_PREFIX)));

const mapContainer = ref<HTMLDivElement>();

const { initMap, map } = useGoogleMaps(mapId.value);

onMounted(async () => {
  await initMap({
    apiKey: apiKey.value,
    elementId: mapElementId.value,
    options: {
      center: center.value,
      zoom: zoom.value,
      ...props.options,
    },
  });

  if (!props.listenToBounds) {
    return;
  }

  listener = map.value?.addListener("bounds_changed", () => {
    const bounds = map.value?.getBounds();
    if (bounds) {
      emit("boundariesChanged", bounds);
    }
  });
});

onBeforeUnmount(() => {
  listener?.remove();
});
</script>

<style lang="scss">
.google-map {
  @apply size-full;

  &__container {
    @apply size-full;
  }
}
</style>
