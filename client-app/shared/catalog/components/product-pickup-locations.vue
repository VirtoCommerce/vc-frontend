<template>
  <VcWidget :title="$t('shared.catalog.shipment_options.title')" class="product-pickup-locations">
    <template #default-container>
      <div class="product-pickup-locations__container">
        <VcLoaderOverlay v-if="loading || modalOpening" />

        <div class="product-pickup-locations__group">
          <VcImage
            src="in-store-pickup.svg"
            :alt="$t('shared.catalog.shipment_options.check_pickup_locations')"
            class="product-pickup-locations__img"
          />

          <button type="button" class="product-pickup-locations__link" @click="openMapModal">
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
  modalOpening.value = true;
  filterContext.clearFilter();

  try {
    await fetchLocations();
  } finally {
    modalOpening.value = false;
  }

  openModal({
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
    @apply flex flex-row gap-x-3 items-center border border-neutral-400 rounded p-2.5 min-h-[74px];
  }

  &__img {
    @apply size-12 shrink-0 rounded;
  }

  &__link {
    @apply inline-flex items-center gap-1 text-sm text-accent cursor-pointer whitespace-nowrap;

    &:hover {
      @apply text-accent-700;
    }
  }
}
</style>
