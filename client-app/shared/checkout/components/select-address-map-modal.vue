<template>
  <VcModal
    :title="$t('shared.checkout.select_bopis_modal.title')"
    max-width="60rem"
    is-mobile-fullscreen
    class="select-address-map-modal"
  >
    <div class="select-address-map-modal__content">
      <div class="select-address-map-modal__sidebar">
        <ul class="select-address-map-modal__list">
          <li v-for="address in addresses" :key="address.id" class="select-address-map-modal__list-item">
            <VcRadioButton
              v-model="selectedAddressId"
              :value="address.id"
              class="select-address-map-modal__radio-button"
              size="sm"
              @change="selectHandler(address, { scrollToSelected: true })"
            >
              <div class="flex flex-col">
                <h3 class="select-address-map-modal__radio-button-name">{{ address.name }}</h3>

                <p class="select-address-map-modal__radio-button-address">{{ getAddressName(address) }}</p>
              </div>
            </VcRadioButton>
          </li>
        </ul>
      </div>

      <div class="select-address-map-modal__map">
        <GoogleMap :api-key="apiKey" :map-id="MAP_ID" :options="{ disableDefaultUI: true }">
          <GoogleMapMarkerClusterer :map-id="MAP_ID">
            <template v-for="address in addresses" :key="address.id">
              <GoogleMapMarker
                v-if="getLatLng(address.geoLocation)"
                :map-id="MAP_ID"
                :position="getLatLng(address.geoLocation)!"
              >
                <div class="select-address-map-modal__info-window">
                  <h3 class="select-address-map-modal__info-window-title">{{ address.name }}</h3>
                  <div class="select-address-map-modal__info-window-content">
                    <dl>
                      <dt>
                        {{ $t("common.address.address") }}
                      </dt>

                      <dd>{{ getAddressName(address) }}</dd>

                      <dt>
                        {{ $t("common.address.phone") }}
                      </dt>

                      <dd>
                        <a :href="`tel:${address.contactPhone}`">{{ address.contactPhone }}</a>
                      </dd>

                      <dt>
                        {{ $t("common.address.email") }}
                      </dt>

                      <dd>
                        <a :href="`mailto:${address.contactEmail}`">{{ address.contactEmail }}</a>
                      </dd>

                      <dt v-if="address.workingHours">
                        {{ $t("common.address.working_hours") }}
                      </dt>

                      <dd v-if="address.workingHours">
                        <VcMarkdownRender
                          class="select-address-map-modal__info-window-working-hours"
                          :src="address.workingHours"
                        />
                      </dd>

                      <dt>
                        {{ $t("common.address.description") }}
                      </dt>

                      <dd>{{ address.description }}</dd>
                    </dl>
                  </div>

                  <div class="select-address-map-modal__info-window-actions">
                    <VcButton variant="no-background" color="secondary" size="xs" @click="closeInfoWindow">
                      {{ $t("common.buttons.cancel") }}
                    </VcButton>

                    <VcButton size="xs" variant="outline" @click="selectHandler(address, { closeInfo: true })">
                      {{ $t("common.buttons.select") }}
                    </VcButton>
                  </div>
                </div>
              </GoogleMapMarker>
            </template>
          </GoogleMapMarkerClusterer>
        </GoogleMap>
      </div>
    </div>
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
import { computed, ref, toRef, watch } from "vue";
import { getAddressName } from "@/core/utilities/address";
import { geoLocationStringToLatLng } from "@/core/utilities/geo";
import { Logger } from "@/core/utilities/logger";
import { useGoogleMaps } from "@/shared/common/composables/useGoogleMaps";
import type { GetPickupLocationsQuery } from "@/core/api/graphql/types";
import GoogleMapMarkerClusterer from "@/shared/common/components/google-maps/google-map-marker-clusterer.vue";
import GoogleMapMarker from "@/shared/common/components/google-maps/google-map-marker.vue";
import GoogleMap from "@/shared/common/components/google-maps/google-map.vue";

type PickupLocationType = NonNullable<NonNullable<GetPickupLocationsQuery["pickupLocations"]>["items"]>[number];

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps>(), {
  addresses: () => [],
});

const addresses = toRef(props, "addresses");
const currentAddress = toRef(props, "currentAddress");
const selectedAddressId = ref<string | undefined>(currentAddress.value?.id);
const changed = computed(() => selectedAddressId.value !== currentAddress.value?.id);

const MAP_ID = "select-bopis-map-modal";

const { zoomToMarkers, markers, zoomToLatLng, closeInfoWindow, map } = useGoogleMaps(MAP_ID);

interface IProps {
  addresses?: PickupLocationType[];
  apiKey: string;
  currentAddress?: { id: string };
}

interface IEmits {
  result: [string];
}

function getLatLng(location: string | undefined) {
  try {
    return geoLocationStringToLatLng(location);
  } catch (error) {
    Logger.warn("Failed to parse geo location", error);
    return null;
  }
}

function selectHandler(address: PickupLocationType, options: { scrollToSelected?: boolean; closeInfo?: boolean } = {}) {
  if (address.id) {
    selectedAddressId.value = address.id;
  }

  if (options.scrollToSelected) {
    const latLng = getLatLng(address.geoLocation);

    if (latLng) {
      zoomToLatLng(latLng);
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
  &__content {
    @apply relative h-[400px] max-h-screen w-full flex flex-col lg:h-[523px] lg:flex-row gap-5;
  }

  &__map {
    @apply size-full order-first lg:order-1 rounded-lg overflow-hidden;
  }

  &__sidebar {
    @apply min-w-56;
  }

  &__list {
    @apply flex flex-col gap-3 overflow-y-auto;
  }

  &__list-item {
    @apply p-2.5 rounded border border-neutral-400;

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
  }

  &__actions {
    @apply flex gap-4 justify-end w-full;
  }

  &__info-window {
    @apply flex flex-col gap-2 font-lato;
  }

  &__info-window-title {
    @apply text-xs font-bold;
  }

  &__info-window-content {
    dl {
      @apply flex flex-col gap-1.5;
    }

    dt {
      @apply text-xxs font-bold;
    }

    dd {
      @apply text-xxs font-normal text-neutral-600;
    }
  }

  &__info-window-working-hours {
    @apply text-xxs;
  }

  &__info-window-actions {
    @apply flex gap-2 justify-end;
  }
}
</style>
