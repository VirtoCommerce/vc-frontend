<template>
  <VcWidget :title="$t('shared.catalog.shipment_options.title')" class="product-pickup-locations">
    <VcLoaderOverlay v-if="loading || modalOpening" />

    <div class="product-pickup-locations__group">
      <VcImage
        src="in-store-pickup.svg"
        :alt="$t('shared.catalog.shipment_options.in_store')"
        class="product-pickup-locations__img"
      />

      <div class="product-pickup-locations__content">
        <div class="product-pickup-locations__header">
          {{ $t("shared.catalog.shipment_options.in_store") }}
        </div>

        <VcButton variant="outline" size="sm" class="mt-2" @click="openMapModal">
          {{ $t("shared.catalog.shipment_options.view_on_map") }}
        </VcButton>
      </div>
    </div>
  </VcWidget>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from "vue";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { BOPIS_MAP_API_KEY, MODULE_ID_SHIPPING } from "@/core/constants/modules";
import { useProductPickupLocations } from "@/shared/catalog/composables/useProductPickupLocations";
import { createProductFilterContext } from "@/shared/checkout/composables/usePickupFilterContext";
import { useModal } from "@/shared/modal";

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
    description: location.description,
  })),
);

const SelectAddressMapModal = defineAsyncComponent(
  () => import("@/shared/checkout/components/select-address-map-modal.vue"),
);

function fetchLocations(keyword?: string) {
  return fetchModalPickupLocations({
    productId: props.productId,
    first: MODAL_FETCH_LIMIT,
    keyword: keyword || undefined,
  });
}

const filterContext = createProductFilterContext({
  onSearch: (keyword: string) => {
    void fetchLocations(keyword);
  },
  loading: modalLoading,
});

const modalOpening = ref(false);

async function openMapModal() {
  modalOpening.value = true;

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
  &__group {
    @apply flex flex-row gap-x-3 items-start border rounded p-3;
  }

  &__content {
    @apply min-w-0;
  }

  &__header {
    @apply font-bold text-lg;

    word-break: break-word;
  }
}
</style>
