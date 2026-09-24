<template>
  <VcWidget
    :title="$t('shared.catalog.shipment_options.title')"
    class="product-pickup-locations"
    data-test-id="shipment-options-widget"
  >
    <template #default-container>
      <div class="product-pickup-locations__container">
        <VcLoaderOverlay v-if="loading || modalOpening" />

        <div class="product-pickup-locations__group">
          <!-- A line icon on a tinted tile, as the design marks this block. What it replaces was a
               full-colour illustration — the only raster sticker on the page, and the one thing in
               the sidebar that did not belong to the palette. -->
          <span class="product-pickup-locations__img" aria-hidden="true">
            <VcIcon name="truck" />
          </span>

          <button
            type="button"
            class="product-pickup-locations__link"
            data-test-id="check-pickup-locations-button"
            @click="openMapModal"
          >
            <span>{{ $t("shared.catalog.shipment_options.check_pickup_locations") }} </span>

            <VcIcon class="product-pickup-locations__icon" name="arrow-right" color="primary" size="xs" />
          </button>
        </div>
      </div>
    </template>
  </VcWidget>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { BOPIS_MAP_API_KEY, MODULE_ID_SHIPPING } from "@/core/constants/modules";
import { useProductPickupLocations } from "@/shared/catalog/composables/useProductPickupLocations";
import { createProductFilterContext } from "@/shared/checkout/composables/usePickupFilterContext";
import { useModal } from "@/shared/modal";
import SelectAddressMapModal from "@/shared/checkout/components/select-address-map-modal.vue";

interface IProps {
  loading: boolean;
  productId: string;
}

const props = defineProps<IProps>();

const MODAL_FETCH_LIMIT = 50;

const { getSettingValue } = useModuleSettings(MODULE_ID_SHIPPING);
const apiKey = computed(() => getSettingValue(BOPIS_MAP_API_KEY));

const { openModal } = useModal();

const {
  pickupLocations: modalPickupLocations,
  fetchPickupLocations: fetchModalPickupLocations,
  pickupLocationsLoading: modalLoading,
} = useProductPickupLocations();

const modalAddresses = computed(() =>
  modalPickupLocations.value.map((location) => ({
    ...location,
    ...location.address,
    id: location.id,
    description: location.description,
  })),
);

function fetchLocations(keyword?: string) {
  return fetchModalPickupLocations({
    productId: props.productId,
    first: MODAL_FETCH_LIMIT,
    keyword: keyword || undefined,
  });
}

const filterContext = createProductFilterContext({
  loading: modalLoading,
});

const modalOpening = ref(false);

async function openMapModal() {
  const trigger = document.activeElement as HTMLElement;
  modalOpening.value = true;
  filterContext.clearFilter();

  try {
    await fetchLocations();
  } finally {
    modalOpening.value = false;
  }

  openModal({
    triggerElement: trigger,
    component: SelectAddressMapModal,
    props: {
      addresses: modalAddresses,
      apiKey: apiKey.value,
      selectable: false,
      filterContext,

      onFilterChange: () => {
        void fetchLocations(filterContext.filterKeyword.value);
      },
    },
  });
}
</script>

<style lang="scss">
.product-pickup-locations {
  &__container {
    @apply relative py-4 px-5;
  }

  &__group {
    // The theme's tile radius, not Tailwind's bare `rounded`: 4px is a step this design does not
    // use anywhere, and next to the 28px plate around it the corner read as unfinished.
    @apply flex min-h-[74px] flex-row items-center gap-x-3 rounded-[--vc-radius] border border-neutral-400 p-2.5;
  }

  &__img {
    // 26 in a 48 tile, the design's own numbers; the tile takes the image radius, one rung below
    // the group's.
    --vc-icon-size: 1.625rem;

    @apply flex size-12 shrink-0 items-center justify-center rounded-[0.625rem] bg-secondary-50 text-secondary-500;
  }

  &__link {
    @apply inline-flex items-center text-start gap-1 text-sm text-[--link-color] cursor-pointer;

    word-break: break-word;

    &:hover {
      @apply text-[--link-hover-color];
    }
  }
}
</style>
