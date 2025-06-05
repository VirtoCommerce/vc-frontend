import { Loader } from "@googlemaps/js-api-loader";
import { createSharedComposable } from "@vueuse/core";
import uniqueId from "lodash/uniqueId";
import { ref, shallowRef } from "vue";
import { Logger } from "@/core/utilities/logger";

export type UseGoogleMapsOptionsType = {
  apiKey: string;
  elementId?: string;
  options?: google.maps.MapOptions;
};

const defaults = {
  apiKey: "",
  elementId: "google-map",
  options: {},
};

export function _useGoogleMaps() {
  const map = shallowRef<google.maps.Map | null>(null);

  const markers = ref<google.maps.marker.AdvancedMarkerElement[]>([]);
  const infoWindow = ref<google.maps.InfoWindow>();

  const isLoading = ref(false);
  const isInitialized = ref(false);

  async function initMap(params: UseGoogleMapsOptionsType) {
    if (isLoading.value) {
      return;
    }

    // If we already have a map but it's for a different element, clean up first
    if (isInitialized.value && map.value) {
      const currentElementId = params.elementId ?? defaults.elementId;
      const mapElement = document.getElementById(currentElementId);

      // If the map element is different or doesn't exist, cleanup and reinitialize
      if (!mapElement || mapElement !== map.value.getDiv()) {
        cleanup();
      } else {
        // Map is already initialized for the correct element
        return;
      }
    }

    isLoading.value = true;

    const loader = new Loader({
      apiKey: params.apiKey,
      version: "weekly",
      libraries: ["places", "marker"],
    });

    try {
      const { Map: GoogleMap } = await loader.importLibrary("maps");
      await loader.importLibrary("places");

      const mapElement = document.getElementById(params.elementId ?? defaults.elementId);
      if (!mapElement) {
        Logger.error(`Map container element with id "${params.elementId ?? defaults.elementId}" not found`);
        return;
      }

      map.value = new GoogleMap(mapElement, {
        mapId: uniqueId("map-"),
        ...params.options,
      });
      isInitialized.value = true;
    } catch (err) {
      Logger.error("Google Maps initialization failed:", err);
    } finally {
      isLoading.value = false;
    }
  }

  function addMarker(markerProps: google.maps.marker.AdvancedMarkerElementOptions) {
    if (!map.value) {
      return;
    }

    const marker = new google.maps.marker.AdvancedMarkerElement({
      ...markerProps,
      map: map.value,
    });
    markers.value = [...markers.value, marker];
    return marker;
  }

  function removeMarker(markerToRemove: google.maps.marker.AdvancedMarkerElement) {
    if (!markerToRemove) {
      return;
    }

    markerToRemove.map = null;

    const markerIndex = markers.value.indexOf(markerToRemove);
    if (markerIndex > -1) {
      markers.value.splice(markerIndex, 1);
    }
  }

  function initInfoWindow() {
    if (!map.value || infoWindow.value) {
      return;
    }

    infoWindow.value = new google.maps.InfoWindow();
  }

  function clearMarkers() {
    markers.value.forEach((marker) => {
      marker.map = null;
    });
    markers.value.length = 0;
  }

  function cleanup() {
    clearMarkers();
    infoWindow.value = undefined;
    map.value = null;
    isInitialized.value = false;
  }

  return {
    map,
    markers,
    infoWindow,
    isInitialized,

    isLoading,

    initMap,
    initInfoWindow,
    addMarker,
    removeMarker,
    cleanup,
  };
}

export const useGoogleMaps = createSharedComposable(_useGoogleMaps);
