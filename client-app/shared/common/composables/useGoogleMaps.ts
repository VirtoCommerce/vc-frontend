import { Loader } from "@googlemaps/js-api-loader";
import uniqueId from "lodash/uniqueId";
import { ref, shallowRef } from "vue";
import { Logger } from "@/core/utilities/logger";

export type UseGoogleMapsOptionsType = {
  apiKey: string;
  elementId: string;
  center?: google.maps.LatLngLiteral;
  zoom?: number;
};

export function useGoogleMaps(options: UseGoogleMapsOptionsType) {
  const { apiKey, elementId, center, zoom } = options;
  const map = shallowRef<google.maps.Map | null>(null);
  const markerLibrary = ref<google.maps.MarkerLibrary | null>(null);
  const error = ref<string | null>(null);
  const isLoading = ref(false);

  const loader = new Loader({
    apiKey,
    version: "weekly",
    libraries: ["places", "marker"],
  });

  async function initMap() {
    if (isLoading.value) {
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const { Map: GoogleMap } = await loader.importLibrary("maps");
      await loader.importLibrary("places");
      markerLibrary.value = await loader.importLibrary("marker");

      const mapElement = document.getElementById(elementId);
      if (!mapElement) {
        throw new Error(`Map container element with id "${elementId}" not found`);
      }

      map.value = new GoogleMap(mapElement, {
        center,
        zoom,
        mapId: uniqueId("map-"),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      error.value = errorMessage;
      Logger.error("Google Maps initialization failed:", err);
    } finally {
      isLoading.value = false;
    }
  }

  return {
    map,
    markerLibrary,
    error,
    isLoading,

    initMap,
  };
}
