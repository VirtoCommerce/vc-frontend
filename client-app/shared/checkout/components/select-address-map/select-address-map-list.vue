<template>
  <VcScrollbar vertical class="select-address-map-list">
    <div
      v-if="addresses.length"
      role="radiogroup"
      :aria-label="$t('pages.checkout.shipping.links.select_pickup_point')"
      class="select-address-map-list__list"
      data-test-id="pickup-locations-list"
    >
      <div
        v-for="address in addresses"
        :key="address.id"
        :data-address-id="address.id"
        :data-country="address.address?.countryName"
        :data-region="address.address?.regionId"
        :data-city="address.address?.city"
        :data-line1="address.address?.line1"
        :data-line2="address.address?.line2"
        :data-pickup-point-name="address.name"
        :data-coords="address.geoLocation"
        class="select-address-map-list__item"
      >
        <VcRadioButton
          :model-value="selectedAddressId"
          :value="address.id"
          name="pickup-location"
          :no-indicator="!selectable"
          class="select-address-map-list__radio-button"
          size="sm"
          :data-test-coords="address.geoLocation"
          @click="$emit('select', address)"
          @keydown.enter="$emit('select', address)"
        >
          <div class="select-address-map-list__label" data-test-id="pickup-location-name">{{ address.name }}</div>

          <div class="select-address-map-list__address" data-test-id="pickup-location-address">
            {{ getAddressName(address) }}
          </div>

          <PickupAvailabilityInfo
            class="select-address-map-list__pickup-availability"
            :availability-type="address.availabilityType"
            :availability-note="address.availabilityNote"
          />
        </VcRadioButton>
      </div>

      <div class="select-address-map-list__footer">
        <div v-if="totalCount" class="select-address-map-list__counter" aria-live="polite">
          {{ t("shared.checkout.select_bopis_modal.showing_count", { loaded: loadedCount, total: totalCount }) }}
        </div>

        <VcButton
          v-if="hasNextPage"
          class="select-address-map-list__load-more"
          size="sm"
          :loading="loadingMore"
          :disabled="loadingMore"
          :aria-busy="loadingMore"
          data-test-id="pickup-locations-load-more"
          @click="$emit('loadMore')"
        >
          {{ t("shared.checkout.select_bopis_modal.load_more") }}
        </VcButton>
      </div>
    </div>

    <div v-else class="select-address-map-list__not-found" data-test-id="pickup-locations-not-found">
      <span>{{ $t("pages.account.order_details.bopis.cart_pickup_points_not_found_by_filter") }}</span>

      <VcButton v-if="filtered" prepend-icon="reset" data-test-id="reset-search-button" @click="$emit('resetFilter')">
        {{ $t("pages.account.order_details.bopis.cart_pickup_points_reset_search") }}
      </VcButton>
    </div>
  </VcScrollbar>
</template>

<script setup lang="ts">
import { computed, nextTick, watch } from "vue";
import { useI18n } from "vue-i18n";
import { getAddressName } from "@/core/utilities/address";
import { focusAddressRadio, isPrefixExtension } from "@/shared/checkout/composables";
import type { PickupLocationType } from "@/shared/checkout/composables";
import PickupAvailabilityInfo from "@/shared/common/components/pickup-availability-info.vue";

interface IProps {
  addresses: PickupLocationType[];
  selectedAddressId?: string;
  selectable?: boolean;
  filtered?: boolean;
  hasNextPage?: boolean;
  loadingMore?: boolean;
  totalCount?: number;
}

interface IEmits {
  (event: "select", address: PickupLocationType): void;
  (event: "resetFilter"): void;
  (event: "loadMore"): void;
}

defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  selectable: true,
});

const { t } = useI18n();

// Approximate progress indicator. `addresses.length` is the post-dedup count (keep-first uniqBy in
// loadMorePickupLocations, BL-BOPIS-008), so when a page contains a duplicate of an already-shown
// location the displayed count can lag the true number of fetched rows. Clamped to totalCount so it
// never overshoots. Accuracy is not load-bearing here — it only drives the "X of Y" hint.
const loadedCount = computed(() => Math.min(props.addresses.length, props.totalCount ?? 0));

watch(
  () => props.addresses.map((address) => address.id),
  async (newIds, oldIds) => {
    // Only move focus on a true "Load more" append: the new list must be a strict extension of the
    // old one (all old ids preserved, in order, at the front) AND longer. A filter/search refetch
    // replaces the set — its length can grow without preserving the prefix — and must NOT steal focus.
    const isAppend = oldIds.length > 0 && isPrefixExtension(oldIds, newIds, { strict: true });

    if (!isAppend) {
      return;
    }

    const firstNewAddress = props.addresses[oldIds.length];

    if (!firstNewAddress) {
      return;
    }

    // Wait two ticks before moving focus to the first newly-appended radio:
    //   1. nextTick() flushes Vue's DOM patch so the new <input> elements exist in the DOM.
    //   2. requestAnimationFrame() waits for the browser to lay out and paint those rows, so
    //      focus() lands on a painted, scrollable element (avoids a focus-then-jump on slow paints).
    await nextTick();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    focusAddressRadio(firstNewAddress.id);
  },
);
</script>

<style lang="scss">
.select-address-map-list {
  @apply w-full max-h-full;

  &__list {
    @apply flex flex-col gap-3;
  }

  &__item {
    @apply p-2.5 rounded-[--vc-radius] border border-neutral-400;

    &:has(:checked),
    &:hover {
      @apply bg-secondary-50;
    }
  }

  &__radio-button {
    @apply flex flex-col gap-0.5;
  }

  &__label {
    @apply mb-0.5 text-base/none font-bold;

    @media (min-width: theme("screens.md")) {
      @apply text-xs;
    }
  }

  &__address {
    @apply text-xs font-normal;
  }

  &__pickup-availability {
    @apply mt-0.5;
  }

  &__footer {
    @apply flex flex-col items-center gap-2;
  }

  &__counter {
    @apply text-xs text-neutral-500 text-center;
  }

  &__load-more {
    @apply w-full;
  }

  &__not-found {
    @apply flex flex-col gap-3 w-60;
  }
}
</style>
