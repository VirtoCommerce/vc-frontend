<template>
  <div :id="elementId" ref="mapContainer" class="size-full"></div>
  <slot />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, toRefs } from "vue";
import { useGoogleMaps } from "@/shared/common/composables/useGoogleMaps";

interface IProps {
  apiKey: string;
  elementId?: string;
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  options?: Omit<google.maps.MapOptions, "center" | "zoom" | "mapId">;
  listenToBounds?: boolean;
  mapId?: string;
}

interface IEmits {
  boundariesChanged: [boundaries: google.maps.LatLngBounds];
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  center: () => ({ lat: 0, lng: 0 }),
  zoom: 10,
  elementId: "google-map",
  mapId: "google-map",
});

let listener: google.maps.MapsEventListener | undefined;

const { apiKey, center, zoom, elementId, mapId } = toRefs(props);

const mapContainer = ref<HTMLDivElement>();

const { initMap, map } = useGoogleMaps(mapId.value);

onMounted(async () => {
  await initMap({
    apiKey: apiKey.value,
    elementId: elementId.value,
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
