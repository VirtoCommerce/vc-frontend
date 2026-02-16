import { onScopeDispose, ref, watch } from "vue";
import { geoLocationStringToLatLng } from "@/core/utilities/geo";
import { Logger } from "@/core/utilities/logger";
import { useGoogleMaps } from "@/shared/common/composables/useGoogleMaps";
import { usePickupFilterContext } from "./usePickupFilterContext";
import type { GetCartPickupLocationsQuery } from "@/core/api/graphql/types";
import type { Ref } from "vue";

export type PickupLocationType = NonNullable<
  NonNullable<GetCartPickupLocationsQuery["cartPickupLocations"]>["items"]
>[number];

interface IUseSelectAddressMapOptions {
  addresses: Ref<PickupLocationType[]>;
  currentAddress: Ref<{ id: string } | undefined>;
  onFilterChange: () => void;
}

const MAP_ID = "select-bopis-map-modal";

function getLatLng(location: string | undefined) {
  try {
    return geoLocationStringToLatLng(location);
  } catch (error) {
    Logger.warn("Failed to parse geo location", error);
    return null;
  }
}

export function useSelectAddressMap(options: IUseSelectAddressMapOptions) {
  const { addresses, currentAddress, onFilterChange } = options;

  const { zoomToMarkers, markers, zoomToLatLng, onceIdle, map } = useGoogleMaps(MAP_ID);
  const { filterIsApplied, clearFilter, pickupLocationsLoading } = usePickupFilterContext();

  // Constants (synced with --pulse-animation-duration in select-address-map-desktop.vue)
  const PULSE_ANIMATION_DURATION_MS = 200;

  // State
  const selectedAddressId = ref<string | undefined>(currentAddress.value?.id);
  const infoCardLocation = ref<PickupLocationType | undefined>(undefined);
  const isPulsing = ref(false);
  let pulseTimerId: ReturnType<typeof setTimeout> | null = null;

  // Info card management
  function showLocationInfoCard(address: PickupLocationType) {
    if (infoCardLocation.value && infoCardLocation.value.id !== address.id) {
      if (pulseTimerId) {
        clearTimeout(pulseTimerId);
      }
      isPulsing.value = true;
      pulseTimerId = setTimeout(() => {
        isPulsing.value = false;
        pulseTimerId = null;
      }, PULSE_ANIMATION_DURATION_MS);
    }
    infoCardLocation.value = address;
    if (address.id) {
      selectedAddressId.value = address.id;
    }
  }

  function closeInfoCard() {
    infoCardLocation.value = undefined;
  }

  // Selection handler
  function selectAddress(
    address: PickupLocationType,
    selectOptions: {
      scrollToSelectedOnMap?: boolean;
      scrollToSelectedOnList?: boolean;
      openInfo?: boolean;
    } = {},
  ) {
    if (address.id) {
      selectedAddressId.value = address.id;
    }

    if (selectOptions.scrollToSelectedOnMap) {
      const latLng = getLatLng(address.geoLocation);

      if (latLng) {
        zoomToLatLng(latLng, 17);

        if (selectOptions.openInfo) {
          onceIdle(() => showLocationInfoCard(address));
        }
      } else if (selectOptions.openInfo) {
        showLocationInfoCard(address);
      }
    } else if (selectOptions.openInfo) {
      showLocationInfoCard(address);
    }

    if (selectOptions.scrollToSelectedOnList && address.id) {
      const listElement = document.querySelector(`[data-address-id="${CSS.escape(address.id)}"]`);

      if (listElement) {
        listElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }

  // Filter management
  function applyFilter() {
    closeInfoCard();
    filterIsApplied.value = true;
    onFilterChange();
  }

  function resetFilter() {
    clearFilter();
    closeInfoCard();
    onFilterChange();
  }

  // Watchers
  watch(
    markers,
    (newMarkers) => {
      if (newMarkers.length > 0 && !selectedAddressId.value) {
        zoomToMarkers();
      }
      if (selectedAddressId.value) {
        const address = addresses.value.find(({ id }) => id === selectedAddressId.value);
        if (!address) {
          zoomToMarkers();
        } else if (address.geoLocation) {
          const latLng = getLatLng(address.geoLocation);
          if (latLng) {
            zoomToLatLng(latLng);
          }
        }
      }
    },
    { immediate: true },
  );

  const unwatch = watch([map, currentAddress], ([newMap, newCurrentAddress]) => {
    if (newMap && newCurrentAddress?.id) {
      const address = addresses.value.find(({ id }) => id === newCurrentAddress.id);

      if (address?.geoLocation) {
        const latLng = getLatLng(address.geoLocation);
        if (latLng) {
          zoomToLatLng(latLng);
        }
      }

      unwatch();
    }
  });

  // Cleanup
  onScopeDispose(() => {
    if (pulseTimerId) {
      clearTimeout(pulseTimerId);
      pulseTimerId = null;
    }
  });

  return {
    // State
    selectedAddressId,
    infoCardLocation,
    isPulsing,
    filterIsApplied,
    pickupLocationsLoading,

    // Methods
    closeInfoCard,
    selectAddress,
    applyFilter,
    resetFilter,
  };
}
