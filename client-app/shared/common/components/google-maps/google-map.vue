<template>
  <div :key="colorScheme" class="google-map">
    <div :id="mapElementId" ref="mapContainer" class="google-map__container"></div>

    <slot />
  </div>
</template>

<script setup lang="ts">
import uniqueId from "lodash/uniqueId";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, toRefs, watch } from "vue";
import { useDarkMode } from "@/core/composables/useDarkMode";
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
  options?: Omit<google.maps.MapOptions, "center" | "zoom" | "mapId" | "colorScheme">;
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

const { isDark } = useDarkMode();
const { initMap, map } = useGoogleMaps(mapId.value);

const colorScheme = computed(() => (isDark.value ? "DARK" : "LIGHT"));

async function createMap() {
  await initMap({
    apiKey: apiKey.value,
    elementId: mapElementId.value,
    options: {
      center: center.value,
      zoom: zoom.value,
      ...props.options,
      // Dark mode system controls colorScheme — must override props.options
      colorScheme: colorScheme.value,
    },
  });
}

function syncBoundsListener() {
  listener?.remove();
  listener = undefined;

  if (!props.listenToBounds || !map.value) {
    return;
  }

  listener = map.value.addListener("bounds_changed", () => {
    const bounds = map.value?.getBounds();
    if (bounds) {
      emit("boundariesChanged", bounds);
    }
  });
}

// colorScheme cannot be changed via setOptions after map init (Google Maps API limitation).
// :key="colorScheme" recreates the DOM subtree (including slot children like markers),
// but does NOT re-trigger this component's onMounted — so we must call createMap manually.
watch(colorScheme, async () => {
  map.value = null;
  await nextTick();
  await createMap();
  syncBoundsListener();
});

onMounted(async () => {
  await createMap();
  syncBoundsListener();
});

onBeforeUnmount(() => {
  listener?.remove();
});
</script>

<style lang="scss">
.google-map {
  @apply size-full;

  &__container {
    @apply size-full rounded-[--vc-radius] border border-secondary bg-secondary-50;
  }
}
</style>
