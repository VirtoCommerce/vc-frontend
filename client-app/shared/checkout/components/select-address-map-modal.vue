<template>
  <VcModal
    :title="$t('shared.checkout.select_bopis_modal.title')"
    max-width="72rem"
    is-mobile-fullscreen
    :is-full-height="!!addresses.length || filterIsApplied"
    class="select-address-map-modal"
  >
    <div v-if="addresses.length || filterIsApplied" class="select-address-map-modal__container">
      <SelectAddressFilter @applyFilter="applyFilter" />

      <div class="select-address-map-modal__content">
        <VcLoaderOverlay v-if="pickupLocationsLoading" />

        <GoogleMap
          :api-key="apiKey"
          :map-id="MAP_ID"
          :options="{ disableDefaultUI: true }"
          class="select-address-map-modal__map"
          :key="addressesKey"
        >
          <GoogleMapMarkerClusterer :map-id="MAP_ID">
            <template v-for="address in addresses" :key="address.id">
              <GoogleMapMarker
                v-if="getLatLng(address.geoLocation)"
                :map-id="MAP_ID"
                :position="getLatLng(address.geoLocation)!"
                :pin-options="createPin()"
                :title="address.name"
                :is-active="selectedAddressId === address.id"
                :active-pin-options="activePinOptions"
                @click="(args) => markerClickHandler(args, address)"
              >
                <div class="select-address-map-modal__info-window">
                  <h3 class="select-address-map-modal__info-window-title">{{ address.name }}</h3>

                  <PickupAvailabilityInfo
                    show-icon
                    icon-size="sm"
                    :availability-type="address.availabilityType"
                    :availability-note="address.availabilityNote"
                  />

                  <div class="select-address-map-modal__info-window-content">
                    <dl>
                      <dt>
                        {{ $t("shared.checkout.select_bopis_modal.location_label") }}
                      </dt>

                      <dd>{{ getAddressName(address) }}</dd>

                      <dt v-if="address.contactPhone">
                        {{ $t("shared.checkout.select_bopis_modal.contact_phone_label") }}
                      </dt>

                      <dd v-if="address.contactPhone">
                        <a :href="`tel:${address.contactPhone}`">{{ address.contactPhone }}</a>
                      </dd>

                      <dt v-if="address.contactEmail">
                        {{ $t("shared.checkout.select_bopis_modal.contact_email_label") }}
                      </dt>

                      <dd v-if="address.contactEmail">
                        <a :href="`mailto:${address.contactEmail}`">{{ address.contactEmail }}</a>
                      </dd>

                      <dt v-if="address.workingHours">
                        {{ $t("shared.checkout.select_bopis_modal.working_hours_label") }}
                      </dt>

                      <dd v-if="address.workingHours">
                        <VcMarkdownRender
                          class="select-address-map-modal__info-window-working-hours"
                          :src="address.workingHours"
                        />
                      </dd>

                      <dt v-if="address.description">
                        {{ $t("shared.checkout.select_bopis_modal.description_label") }}
                      </dt>

                      <dd v-if="address.description">{{ address.description }}</dd>
                    </dl>
                  </div>

                  <div class="select-address-map-modal__info-window-actions">
                    <VcButton variant="no-background" color="secondary" size="xs" @click="closeInfoWindow">
                      {{ $t("common.buttons.cancel") }}
                    </VcButton>

                    <VcButton
                      size="xs"
                      variant="outline"
                      @click="selectHandler(address, { closeInfo: true, scrollToSelectedOnList: true })"
                    >
                      {{ $t("common.buttons.select") }}
                    </VcButton>
                  </div>
                </div>
              </GoogleMapMarker>
            </template>
          </GoogleMapMarkerClusterer>
        </GoogleMap>

        <div v-if="isMobile && selectedAddress" class="select-address-map-modal__info-window-mobile">
          <h3 class="select-address-map-modal__info-window-mobile-title">{{ selectedAddress.name }}</h3>

          <PickupAvailabilityInfo
            show-icon
            icon-size="sm"
            :availability-type="selectedAddress.availabilityType"
            :availability-note="selectedAddress.availabilityNote"
          />

          <div class="select-address-map-modal__info-window-mobile-content">
            <dl>
              <dt>
                {{ $t("shared.checkout.select_bopis_modal.location_label") }}
              </dt>

              <dd>{{ getAddressName(selectedAddress) }}</dd>

              <dt v-if="selectedAddress.contactPhone">
                {{ $t("shared.checkout.select_bopis_modal.contact_phone_label") }}
              </dt>

              <dd v-if="selectedAddress.contactPhone">
                <a :href="`tel:${selectedAddress.contactPhone}`">{{ selectedAddress.contactPhone }}</a>
              </dd>

              <dt v-if="selectedAddress.contactEmail">
                {{ $t("shared.checkout.select_bopis_modal.contact_email_label") }}
              </dt>

              <dd v-if="selectedAddress.contactEmail">
                <a :href="`mailto:${selectedAddress.contactEmail}`">{{ selectedAddress.contactEmail }}</a>
              </dd>

              <dt v-if="selectedAddress.workingHours">
                {{ $t("shared.checkout.select_bopis_modal.working_hours_label") }}
              </dt>

              <dd v-if="selectedAddress.workingHours">
                <VcMarkdownRender
                  class="select-address-map-modal__info-window-mobile-working-hours"
                  :src="selectedAddress.workingHours"
                />
              </dd>

              <dt v-if="selectedAddress.description">
                {{ $t("shared.checkout.select_bopis_modal.description_label") }}
              </dt>

              <dd v-if="selectedAddress.description">{{ selectedAddress.description }}</dd>
            </dl>
          </div>
        </div>

        <VcScrollbar vertical class="select-address-map-modal__sidebar">
          <ul v-if="addresses.length" class="select-address-map-modal__list">
            <li
              v-for="address in addresses"
              :key="address.id"
              :data-address-id="address.id"
              class="select-address-map-modal__list-item"
            >
              <VcRadioButton
                v-model="selectedAddressId"
                :value="address.id"
                class="select-address-map-modal__radio-button"
                size="sm"
                @change="selectHandler(address, { scrollToSelectedOnMap: true })"
              >
                <h3 class="select-address-map-modal__radio-button-name">{{ address.name }}</h3>

                <p class="select-address-map-modal__radio-button-address">{{ getAddressName(address) }}</p>

                <PickupAvailabilityInfo
                  class="select-address-map-modal__radio-button-pickup-availability"
                  show-icon
                  icon-size="xs"
                  :availability-type="address.availabilityType"
                  :availability-note="address.availabilityNote"
                />
              </VcRadioButton>
            </li>
          </ul>

          <div v-else class="select-address-map-modal__not-found">
            <span>{{ $t("pages.account.order_details.bopis.cart_pickup_points_not_found_by_filter") }}</span>

            <VcButton prepend-icon="reset" @click="resetFilter">
              {{ $t("pages.account.order_details.bopis.cart_pickup_points_reset_search") }}
            </VcButton>
          </div>
        </VcScrollbar>
      </div>
    </div>

    <div v-else>{{ $t("pages.account.order_details.bopis.cart_pickup_points_not_found") }}</div>

    <template #actions="{ close }">
      <div class="select-address-map-modal__actions">
        <VcButton variant="outline" size="sm" color="neutral" @click="close">
          {{ $t("common.buttons.cancel") }}
        </VcButton>

        <VcButton variant="solid" size="sm" :disabled="!changed" @click="saveHandler(close)">
          {{ $t("common.buttons.save") }}
        </VcButton>
      </div>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { useBreakpoints, breakpointsTailwind } from "@vueuse/core";
import { computed, ref, toRef, watch } from "vue";
import { getAddressName } from "@/core/utilities/address";
import { geoLocationStringToLatLng } from "@/core/utilities/geo";
import { Logger } from "@/core/utilities/logger";
import { useCartPickupLocations } from "@/shared/cart";
import { SelectAddressFilter } from "@/shared/checkout";
import { useGoogleMaps } from "@/shared/common/composables/useGoogleMaps";
import cubeIcon from "@/ui-kit/icons/cube.svg?raw";
import { getColorValue } from "@/ui-kit/utilities/css";
import type { GetCartPickupLocationsQuery } from "@/core/api/graphql/types";
import GoogleMapMarkerClusterer from "@/shared/common/components/google-maps/google-map-marker-clusterer.vue";
import GoogleMapMarker from "@/shared/common/components/google-maps/google-map-marker.vue";
import GoogleMap from "@/shared/common/components/google-maps/google-map.vue";
import PickupAvailabilityInfo from "@/shared/common/components/pickup-availability-info.vue";

type PickupLocationType = NonNullable<NonNullable<GetCartPickupLocationsQuery["cartPickupLocations"]>["items"]>[number];

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  addresses: () => [],
});

const addresses = toRef(props, "addresses");
const addressesKey = computed(() => addresses.value.map((a) => a.id).join("-"));
const currentAddress = toRef(props, "currentAddress");
const selectedAddressId = ref<string | undefined>(currentAddress.value?.id);
const changed = computed(() => selectedAddressId.value !== currentAddress.value?.id);

const selectedAddress = computed(() => addresses.value.find((x) => x.id == selectedAddressId.value));

const MAP_ID = "select-bopis-map-modal";

const { zoomToMarkers, markers, zoomToLatLng, closeInfoWindow, map } = useGoogleMaps(MAP_ID);
const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("md");

interface IProps {
  addresses?: PickupLocationType[];
  apiKey: string;
  currentAddress?: { id: string };
}

interface IEmits {
  (event: "result", value: string): void;
  (event: "filterChange"): void;
}

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

const { filterIsApplied, clearFilter, pickupLocationsLoading } = useCartPickupLocations();

function applyFilter() {
  filterIsApplied.value = true;
  emit("filterChange");
}

function resetFilter() {
  clearFilter();
  applyFilter();
}

function getLatLng(location: string | undefined) {
  try {
    return geoLocationStringToLatLng(location);
  } catch (error) {
    Logger.warn("Failed to parse geo location", error);
    return null;
  }
}

function markerClickHandler(args: { cancelled: boolean }, address: PickupLocationType) {
  if (isMobile.value) {
    args.cancelled = true;
    selectHandler(address);
  }
}

function selectHandler(
  address: PickupLocationType,
  options: { scrollToSelectedOnMap?: boolean; scrollToSelectedOnList?: boolean; closeInfo?: boolean } = {},
) {
  if (address.id) {
    selectedAddressId.value = address.id;
  }

  if (options.scrollToSelectedOnMap) {
    const latLng = getLatLng(address.geoLocation);

    if (latLng) {
      zoomToLatLng(latLng);
    }
  }

  if (options.scrollToSelectedOnList && !isMobile.value) {
    const listElement = document.querySelector(`[data-address-id="${address.id}"]`);

    if (listElement) {
      listElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  if (options.closeInfo) {
    closeInfoWindow();
  }
}

function saveHandler(close: () => void) {
  if (selectedAddressId.value) {
    emit("result", selectedAddressId.value);
  }

  close();
}

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
  {
    immediate: true,
  },
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
</script>

<style lang="scss">
.select-address-map-modal {
  &__container {
    @apply flex flex-col h-full pt-0;
  }

  &__content {
    @apply relative flex flex-col gap-3 w-full flex-1 max-h-[90%];

    @media (min-width: theme("screens.md")) {
      @apply flex-row;
    }
  }

  &__map {
    @apply grow w-full;

    @media (min-width: theme("screens.md")) {
      @apply h-auto ps-0;
    }
  }

  &__sidebar {
    @apply shrink-0 min-w-56 max-h-[40%];

    @media (min-width: theme("screens.md")) {
      @apply order-first max-h-full pe-2.5;
    }
  }

  &__list {
    @apply flex flex-col gap-3;
  }

  &__list-item {
    @apply p-2.5 rounded-[--vc-radius] border border-neutral-400;

    &:has(:checked) {
      @apply bg-secondary-50;
    }
  }

  &__radio-button {
    @apply flex flex-col gap-0.5;

    &-name {
      @apply text-xs font-bold;
    }

    &-address {
      @apply text-xs font-normal;
    }

    &-pickup-availability {
      @apply text-xs font-normal;
    }
  }

  &__not-found {
    @apply flex flex-col gap-3 w-60;
  }

  &__actions {
    @apply flex gap-4 justify-end w-full;
  }

  &__info-window {
    @apply flex flex-col gap-2 font-lato w-52 max-w-full;
  }

  &__info-window-title {
    @apply text-xs font-bold;
  }

  &__info-window-content {
    dl {
      @apply flex flex-col gap-1.5;
    }

    dt {
      @apply text-xxs font-bold break-words;
    }

    dd {
      @apply text-xxs font-normal text-neutral-600 break-words;
    }
  }

  &__info-window-working-hours {
    @apply text-xxs;
  }

  &__info-window-actions {
    @apply flex gap-2 justify-end sticky bottom-0 bg-additional-50 pt-2;
  }

  &__marker-glyph {
    @apply fill-additional-50 size-7;
  }

  &__info-window-mobile {
    @apply flex flex-col gap-2 bg-neutral-200 font-lato w-full px-5 h-[50%] mt-[-30%];
    z-index: 10;

    &::before {
      @apply bg-neutral-200;
      -webkit-clip-path: polygon(0 100%, 50% 0, 100% 100%);
      clip-path: polygon(0 100%, 50% 0, 100% 100%);
      content: "";
      margin-left: calc(50% - 12.5px);
      top: -12px;
      position: relative;
      height: 12px;
      width: 25px;
    }
  }

  &__info-window-mobile-title {
    @apply text-xs font-bold;
  }

  &__info-window-mobile-content {
    dl {
      @apply flex flex-col gap-1.5;
    }

    dt {
      @apply text-xxs font-bold break-words;
    }

    dd {
      @apply text-xxs font-normal text-neutral-600 break-words;
    }
  }

  &__info-window-mobile-working-hours {
    @apply text-xxs;
  }
}
</style>
