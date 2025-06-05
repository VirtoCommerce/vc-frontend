import { Loader } from "@googlemaps/js-api-loader";
import uniqueId from "lodash/uniqueId";
import { ref, shallowRef, onUnmounted } from "vue";
import { Logger } from "@/core/utilities/logger";
import type { Ref, ShallowRef } from "vue";

export type UseGoogleMapsOptionsType = {
  apiKey: string;
  elementId?: string;
  options?: google.maps.MapOptions;
};

interface IMapInstance {
  refCount: Ref<number>;
  map: ShallowRef<google.maps.Map | null>;
  markers: Ref<google.maps.marker.AdvancedMarkerElement[]>;
  infoWindow: Ref<google.maps.InfoWindow | undefined>;
  isLoading: Ref<boolean>;
  isInitialized: Ref<boolean>;
}

const defaults = {
  apiKey: "",
  elementId: "google-map",
  options: {},
};

// Global storage for all map instances
const mapInstances = new Map<string, IMapInstance>();

export function useGoogleMaps(mapId: string) {
  let instance = mapInstances.get(mapId);

  if (!instance) {
    const map = shallowRef<google.maps.Map | null>(null);
    const markers = ref<google.maps.marker.AdvancedMarkerElement[]>([]);
    const infoWindow = ref<google.maps.InfoWindow | undefined>(undefined);
    const isLoading = ref(false);
    const isInitialized = ref(false);
    const refCount = ref(0);

    instance = {
      refCount,
      map,
      markers,
      infoWindow,
      isLoading,
      isInitialized,
    };
    mapInstances.set(mapId, instance);
  }

  instance.refCount.value++;

  const { map, markers, infoWindow, isLoading, isInitialized, refCount } = instance;

  async function initMap(params: UseGoogleMapsOptionsType) {
    const currentInstance = mapInstances.get(mapId);
    if (!currentInstance || currentInstance.isLoading.value) {
      return;
    }

    const elementId = params.elementId ?? defaults.elementId;
    const mapElement = document.getElementById(elementId);

    if (!mapElement) {
      Logger.error(`Map container element with id "${elementId}" not found`);
      return;
    }

    // Check if map exists and is properly attached to the DOM
    // The map's div might be null if the element was recreated by v-if
    const mapDiv = currentInstance.map.value?.getDiv();
    const isMapAttached = mapDiv === mapElement && mapElement.children.length > 0 && mapDiv !== null;

    // If map is already initialized and properly attached, nothing to do
    if (currentInstance.map.value && currentInstance.isInitialized.value && isMapAttached) {
      return;
    }

    currentInstance.isLoading.value = true;

    const loader = new Loader({
      apiKey: params.apiKey,
      version: "weekly",
      libraries: ["places", "marker"],
    });

    try {
      const { Map: GoogleMap } = await loader.importLibrary("maps");
      await loader.importLibrary("places");

      mapElement.innerHTML = "";

      const mapInstance = new GoogleMap(mapElement, {
        mapId: uniqueId("map-"),
        ...params.options,
      });

      currentInstance.map.value = mapInstance;
      currentInstance.isInitialized.value = true;
    } catch (err) {
      Logger.error("Google Maps initialization failed:", err);
    } finally {
      currentInstance.isLoading.value = false;
    }
  }

  function addMarker(markerProps: google.maps.marker.AdvancedMarkerElementOptions) {
    const currentInstance = mapInstances.get(mapId);
    if (!currentInstance?.map.value) {
      Logger.warn(`Cannot add marker: map not initialized for mapId: ${mapId}`);
      return;
    }

    const marker = new google.maps.marker.AdvancedMarkerElement({
      ...markerProps,
      map: currentInstance.map.value,
    });

    const currentMarkers = currentInstance.markers.value ?? [];
    currentInstance.markers.value = [...currentMarkers, marker];

    return marker;
  }

  function removeMarker(markerToRemove: google.maps.marker.AdvancedMarkerElement) {
    const currentInstance = mapInstances.get(mapId);
    if (!markerToRemove || !currentInstance) {
      return;
    }

    markerToRemove.map = null;

    const currentMarkers = currentInstance.markers.value ?? [];
    const markerIndex = currentMarkers.indexOf(markerToRemove);
    if (markerIndex > -1) {
      const newMarkers = [...currentMarkers];
      newMarkers.splice(markerIndex, 1);
      currentInstance.markers.value = newMarkers;
    }
  }

  function initInfoWindow() {
    const currentInstance = mapInstances.get(mapId);
    if (!currentInstance?.map.value || currentInstance.infoWindow.value) {
      return;
    }

    currentInstance.infoWindow.value = new google.maps.InfoWindow();
  }

  function clearMarkers() {
    const currentInstance = mapInstances.get(mapId);
    if (!currentInstance) {
      return;
    }

    const currentMarkers = currentInstance.markers.value ?? [];
    currentMarkers.forEach((marker) => {
      marker.map = null;
    });
    currentInstance.markers.value = [];
  }

  function cleanup() {
    const currentInstance = mapInstances.get(mapId);
    if (!currentInstance) {
      return;
    }

    currentInstance.refCount.value--;

    if (currentInstance.refCount.value <= 0) {
      clearMarkers();

      if (currentInstance.infoWindow.value) {
        currentInstance.infoWindow.value.close();
        currentInstance.infoWindow.value = undefined;
      }

      currentInstance.map.value = null;
      currentInstance.isInitialized.value = false;
      currentInstance.isLoading.value = false;

      mapInstances.delete(mapId);
    }
  }

  onUnmounted(() => {
    cleanup();
  });

  return {
    refCount,

    map,
    markers,
    infoWindow,
    isInitialized,
    isLoading,
    initMap,
    initInfoWindow,
    addMarker,
    removeMarker,
    clearMarkers,
    cleanup,
  };
}
