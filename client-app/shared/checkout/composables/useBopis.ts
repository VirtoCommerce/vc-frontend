import { computed, defineAsyncComponent, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { BOPIS_MAP_API_KEY, BOPIS_MAP_ENABLED_KEY, MODULE_ID_SHIPPING } from "@/core/constants/modules";
import { useCartPickupLocations, useFullCart } from "@/shared/cart/composables";
import { createCartFilterContext } from "@/shared/checkout/composables/usePickupFilterContext";
import { useModal } from "@/shared/modal";
import type { ProductPickupLocation } from "@/core/api/graphql/types";
import type { AnyAddressType } from "@/core/types";

export const BOPIS_CODE = "BuyOnlinePickupInStore";

const ADDRESSES_FETCH_MAP_LIMIT = 50;
const ADDRESSES_FETCH_LIST_LIMIT = 6;

export function useBopis() {
  const { t } = useI18n();

  const { availableShippingMethods, updateShipment, shipment } = useFullCart();
  const { isEnabled, getSettingValue } = useModuleSettings(MODULE_ID_SHIPPING);

  const {
    pickupLocations,
    fetchPickupLocations,
    loadMorePickupLocations,
    pickupLocationsLoading,
    pickupLocationsLoadingMore,
    pickupLocationsTotalCount,
    pickupLocationsHasNextPage,
    filterKeyword,
    buildFilter,
    clearFilter,
  } = useCartPickupLocations();

  const hasBOPIS = computed(() => availableShippingMethods.value.some((method) => method.code === BOPIS_CODE));
  const bopisMethod = computed(() => availableShippingMethods.value.find((method) => method.code === BOPIS_CODE));
  const isBopisMapEnabled = computed(() => isEnabled(BOPIS_MAP_ENABLED_KEY));
  const bopisMapApiKey = computed(() => getSettingValue(BOPIS_MAP_API_KEY));

  const modalComponent = computed(() =>
    isBopisMapEnabled.value
      ? defineAsyncComponent(() => import("@/shared/checkout/components/select-address-map-modal.vue"))
      : defineAsyncComponent(() => import("@/shared/checkout/components/select-address-modal.vue")),
  );

  const modalOpening = ref(false);

  const addresses = computed<ProductPickupLocation[]>(() => pickupLocations.value ?? []);
  const pageSize = computed(() => (isBopisMapEnabled.value ? ADDRESSES_FETCH_MAP_LIMIT : ADDRESSES_FETCH_LIST_LIMIT));

  const normalizedAddresses = computed<AnyAddressType[]>(() =>
    addresses.value.map((pickupInStoreAddress) => ({
      ...(isBopisMapEnabled.value ? pickupInStoreAddress : {}),
      ...pickupInStoreAddress.address,
      description: isBopisMapEnabled.value ? pickupInStoreAddress.description : pickupInStoreAddress.name,
      availabilityType: pickupInStoreAddress.availabilityType,
      availabilityNote: pickupInStoreAddress.availabilityNote,
      availableQuantity: pickupInStoreAddress.availableQuantity,
    })),
  );

  const { openModal } = useModal();

  async function openSelectAddressModal(cartId: string) {
    const trigger = document.activeElement as HTMLElement;
    modalOpening.value = true;

    clearFilter();

    try {
      await fetchPickupLocations({
        cartId,
        first: pageSize.value,
      });
    } finally {
      modalOpening.value = false;
    }

    const filterContext = createCartFilterContext();

    openModal({
      triggerElement: trigger,
      component: modalComponent.value,

      props: {
        addresses: normalizedAddresses,
        apiKey: isBopisMapEnabled.value ? bopisMapApiKey.value : undefined,
        filterContext,
        currentAddress: {
          ...shipment.value?.deliveryAddress,
          id: shipment.value?.pickupLocation?.id,
        },
        omitFieldsOnCompare: [
          "outerId",
          "firstName",
          "lastName",
          "name",
          "organization",
          "countryCode",
          "regionName",
          "email",
          "addressType",
          "description",
        ],
        isCorporateAddresses: true,
        allowAddNewAddress: false,
        showAvailability: true,
        showFilters: true,
        emptyText: t("pages.account.order_details.bopis.cart_pickup_points_not_found"),
        pageSize: pageSize.value,
        paginationMode: "server",
        loading: pickupLocationsLoading,
        totalCount: pickupLocationsTotalCount,
        hasNextPage: pickupLocationsHasNextPage,
        loadingMore: pickupLocationsLoadingMore,

        onFilterChange: async () => {
          await fetchPickupLocations({
            cartId,
            first: pageSize.value,
            keyword: filterKeyword.value,
            filter: buildFilter(),
          });
        },

        onResetFilter: clearFilter,

        // Two mutually-exclusive pagination handlers selected by the `Shipping.Bopis.GoogleMaps.Enabled`
        // setting via `modalComponent` above; only one is ever wired to a live UI per modal session:
        //   - map OFF (default): select-address-modal.vue renders VcPagination → onPageChange.
        //     Offset-style cursor — `after` is the item offset `(page - 1) * pageSize` resolved server-side.
        //   - map ON: select-address-map-modal.vue renders a "Load more" button → onLoadMore.
        //     Opaque cursor — `after` is the server `endCursor` (set inside loadMorePickupLocations).
        // Both write to the same useCartPickupLocations state, so the two `after` semantics must never
        // be mixed within one session; the modal switch guarantees that.
        onPageChange: async (newPage: number) => {
          await fetchPickupLocations({
            cartId,
            first: pageSize.value,
            after: ((newPage - 1) * pageSize.value).toString(),
            keyword: filterKeyword.value,
            filter: buildFilter(),
          });
        },

        // map ON only — opaque-cursor "Load more"; `after`, keyword and filter are supplied internally
        // from the committed snapshot (the values that produced the stored endCursor), not live refs.
        onLoadMore: async () => {
          await loadMorePickupLocations({
            cartId,
            first: pageSize.value,
          });
        },

        onResult: async (addressOrAddressId: AnyAddressType | string) => {
          if (typeof addressOrAddressId === "string") {
            const item = addresses.value.find(({ id }) => id === addressOrAddressId);

            if (item?.address) {
              await updateShipment({
                id: shipment.value?.id,
                pickupLocationId: item.address.id,
              });
            }

            return;
          }

          await updateShipment({
            id: shipment.value?.id,
            pickupLocationId: addressOrAddressId.id,
          });
        },
      },
    });
  }

  return {
    addresses,
    bopisMethod,
    hasBOPIS,

    loading: pickupLocationsLoading,

    modalOpening,
    openSelectAddressModal,
  };
}
