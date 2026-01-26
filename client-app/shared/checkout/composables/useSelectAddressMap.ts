import { computed, ref, watch } from "vue";
import { getAddressName } from "@/core/utilities/address";
import { geoLocationStringToLatLng } from "@/core/utilities/geo";
import { Logger } from "@/core/utilities/logger";
import { useCartPickupLocations } from "@/shared/cart";
import { useGoogleMaps } from "@/shared/common/composables/useGoogleMaps";
import cubeIcon from "@/ui-kit/icons/cube.svg?raw";
import { getColorValue } from "@/ui-kit/utilities/css";
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

export function useSelectAddressMap(options: IUseSelectAddressMapOptions) {
  const { addresses, currentAddress, onFilterChange } = options;

  const { zoomToMarkers, markers, zoomToLatLng, onceIdle, map } = useGoogleMaps(MAP_ID);
  const { filterIsApplied, clearFilter, pickupLocationsLoading } = useCartPickupLocations();

  // State
  const addressesKey = computed(() => addresses.value.map((a) => a.id).join("-"));
  const selectedAddressId = ref<string | undefined>(currentAddress.value?.id);
  const infoCardLocation = ref<PickupLocationType | undefined>(undefined);
  const isPulsing = ref(false);

  // Pin styling
  const pinColor = getColorValue("primary");
  const parser = new DOMParser();
  const cube = parser.parseFromString(cubeIcon, "image/svg+xml").documentElement;
  cube.classList.add("select-address-map-modal__marker-glyph");

  function cloneElement<T extends Element>(el: T): T {
    return el.cloneNode(true) as T;
  }

  const activePinOptions = {
    background: getColorValue("success"),
    borderColor: getColorValue("success"),
    scale: 1.7,
  };

  function createPin() {
    return {
      background: pinColor,
      borderColor: pinColor,
      glyph: cloneElement(cube),
      scale: 1.5,
    };
  }

  // Geo utilities
  function getLatLng(location: string | undefined) {
    try {
      return geoLocationStringToLatLng(location);
    } catch (error) {
      Logger.warn("Failed to parse geo location", error);
      return null;
    }
  }

  // Info card management
  function showLocationInfoCard(address: PickupLocationType) {
    if (infoCardLocation.value && infoCardLocation.value.id !== address.id) {
      isPulsing.value = true;
      setTimeout(() => {
        isPulsing.value = false;
      }, 200);
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
    filterIsApplied.value = true;
    onFilterChange();
  }

  function resetFilter() {
    clearFilter();
    applyFilter();
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

      if (address && address.geoLocation) {
        const latLng = getLatLng(address.geoLocation);
        if (latLng) {
          zoomToLatLng(latLng);
        }
      }

      unwatch();
    }
  });

  return {
    // Constants
    MAP_ID,

    // State
    addressesKey,
    selectedAddressId,
    infoCardLocation,
    isPulsing,
    filterIsApplied,
    pickupLocationsLoading,

    // Pin options
    activePinOptions,
    createPin,

    // Methods
    getLatLng,
    getAddressName,
    showLocationInfoCard,
    closeInfoCard,
    selectAddress,
    applyFilter,
    resetFilter,
  };
}
