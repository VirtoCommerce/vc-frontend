import { computed, defineAsyncComponent, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { BOPIS_MAP_API_KEY, BOPIS_MAP_ENABLED_KEY, MODULE_ID_SHIPPING } from "@/core/constants/modules";
import { useCartPickupLocations, useFullCart } from "@/shared/cart/composables";
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
    pickupLocationsLoading,
    pickupLocationsTotalCount,
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

  const addresses = computed<ProductPickupLocation[]>(() => (pickupLocations.value as ProductPickupLocation[]) ?? []);
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

  async function fetchAddresses({
    cartId,
    keyword,
    filter,
    sort,
    first,
    after,
  }: {
    cartId: string;
    keyword?: string;
    filter?: string;
    sort?: string;
    first?: number;
    after?: string;
  }) {
    await fetchPickupLocations({ cartId, keyword, filter, sort, first, after });
  }

  const { openModal } = useModal();

  async function openSelectAddressModal(cartId: string) {
    modalOpening.value = true;

    clearFilter();

    try {
      await fetchAddresses({
        cartId,
        first: pageSize.value,
      });
    } finally {
      modalOpening.value = false;
    }

    openModal({
      component: modalComponent.value,

      props: {
        addresses: normalizedAddresses,
        apiKey: isBopisMapEnabled.value ? bopisMapApiKey.value : undefined,
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

        onFilterChange: async () => {
          await fetchAddresses({
            cartId,
            first: pageSize.value,
            keyword: filterKeyword.value,
            filter: buildFilter(),
          });
        },

        onResetFilter: () => {
          clearFilter();
        },

        onPageChange: async (newPage: number) => {
          await fetchAddresses({
            cartId,
            first: pageSize.value,
            after: ((newPage - 1) * pageSize.value).toString(),
            keyword: filterKeyword.value,
            filter: buildFilter(),
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
