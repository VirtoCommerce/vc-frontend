<template>
  <div :id="elementId" ref="mapContainer" class="size-full"></div>
  <slot :map="map" :marker-library="markerLibrary" :error="error" :is-loading="isLoading" />
</template>

<script setup lang="ts">
import { onMounted, ref, toRefs } from "vue";
import { useGoogleMaps } from "@/shared/common/composables/useGoogleMaps";

interface IProps {
  apiKey: string;
  elementId?: string;
  center?: google.maps.LatLngLiteral;
  zoom?: number;
}

const props = withDefaults(defineProps<IProps>(), {
  center: () => ({ lat: 0, lng: 0 }),
  zoom: 10,
  elementId: "google-map",
});

const { apiKey, center, zoom, elementId } = toRefs(props);

const mapContainer = ref<HTMLDivElement>();

const { map, markerLibrary, error, isLoading, initMap } = useGoogleMaps({
  apiKey: apiKey.value,
  elementId: elementId.value,
  center: center.value,
  zoom: zoom.value,
});

onMounted(async () => {
  await initMap();
});
</script>
