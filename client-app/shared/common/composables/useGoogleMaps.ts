import { Loader } from "@googlemaps/js-api-loader";
import { createSharedComposable } from "@vueuse/core";
import uniqueId from "lodash/uniqueId";
import { ref, shallowRef } from "vue";
import { Logger } from "@/core/utilities/logger";

export type UseGoogleMapsOptionsType = {
  apiKey: string;
  elementId?: string;
  center?: google.maps.LatLngLiteral;
  zoom?: number;
};

const defaults = {
  apiKey: "",
  elementId: "google-map",
  center: { lat: 0, lng: 0 },
  zoom: 10,
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
        center: params.center ?? defaults.center,
        zoom: params.zoom ?? defaults.zoom,
        mapId: uniqueId("map-"),
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
    console.trace("addMarker", markerProps);

    const marker = new google.maps.marker.AdvancedMarkerElement({
      ...markerProps,
      map: map.value,
    });
    markers.value = [...markers.value, marker];
    return marker;
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
    cleanup,
  };
}

export const useGoogleMaps = createSharedComposable(_useGoogleMaps);
