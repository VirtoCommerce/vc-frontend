<template><slot /></template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { Logger } from "@/core/utilities";

interface IProps {
  position: google.maps.LatLngLiteral;
  map: google.maps.Map;
  markerLibrary: google.maps.MarkerLibrary | null;
  title?: string;
}

const props = defineProps<IProps>();

const marker = ref<google.maps.marker.AdvancedMarkerElement>();

function createMarker() {
  if (!props.map || !props.markerLibrary) {
    return;
  }

  try {
    marker.value = new props.markerLibrary.AdvancedMarkerElement({
      map: props.map,
      position: props.position,
      title: props.title,
    });
  } catch (error) {
    Logger.error("Failed to create AdvancedMarkerElement:", error);
  }
}

onMounted(() => {
  createMarker();
});

watch(
  () => props.markerLibrary,
  () => {
    createMarker();
  },
);

watch(
  () => props.map,
  () => {
    createMarker();
  },
);
</script>
