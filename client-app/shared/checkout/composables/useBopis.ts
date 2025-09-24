import { computed, defineAsyncComponent } from "vue";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { BOPIS_MAP_API_KEY, BOPIS_MAP_ENABLED_KEY, MODULE_ID_SHIPPING } from "@/core/constants/modules";
import { useCartPickupLocations, useFullCart } from "@/shared/cart/composables";
import { useModal } from "@/shared/modal";
import type { ProductPickupLocation } from "@/core/api/graphql/types";
import type { AnyAddressType } from "@/core/types";

export const BOPIS_CODE = "BuyOnlinePickupInStore";

const ADDRESSES_FETCH_LIMIT = 999;

export function useBopis() {
  const { availableShippingMethods, updateShipment, shipment } = useFullCart();
  const { isEnabled, getSettingValue } = useModuleSettings(MODULE_ID_SHIPPING);

  const { pickupLocations, fetchPickupLocations, pickupLocationsLoading } = useCartPickupLocations();

  const addresses = computed<ProductPickupLocation[]>(() => (pickupLocations.value as ProductPickupLocation[]) ?? []);

  const hasBOPIS = computed(() => availableShippingMethods.value.some((method) => method.code === BOPIS_CODE));
  const bopisMethod = computed(() => availableShippingMethods.value.find((method) => method.code === BOPIS_CODE));
  const isBopisMapEnabled = computed(() => isEnabled(BOPIS_MAP_ENABLED_KEY));
  const bopisMapApiKey = computed(() => getSettingValue(BOPIS_MAP_API_KEY));

  const modalComponent = computed(() =>
    isBopisMapEnabled.value
      ? defineAsyncComponent(() => import("@/shared/checkout/components/select-address-map-modal.vue"))
      : defineAsyncComponent(() => import("@/shared/checkout/components/select-address-modal.vue")),
  );

  const normalizedAddresses = computed<AnyAddressType[]>(() =>
    addresses.value.map((pickupInStoreAddress) => ({
      ...(isBopisMapEnabled.value ? pickupInStoreAddress : {}),
      ...pickupInStoreAddress.address,
      description: isBopisMapEnabled.value ? pickupInStoreAddress.description : pickupInStoreAddress.name,
    })),
  );

  async function fetchAddresses({
    cartId,
    keyword,
    sort,
    first,
    after,
  }: {
    cartId: string;
    keyword?: string;
    sort?: string;
    first?: number;
    after?: string;
  }) {
    await fetchPickupLocations({ cartId, keyword, sort, first, after });
  }

  const { openModal } = useModal();

  async function openSelectAddressModal(cartId: string) {
    await fetchAddresses({ cartId, first: ADDRESSES_FETCH_LIMIT });

    openModal({
      component: modalComponent.value,

      props: {
        addresses: normalizedAddresses.value,
        apiKey: isBopisMapEnabled.value ? bopisMapApiKey.value : undefined,
        currentAddress: {
          ...shipment.value?.deliveryAddress,
          id: shipment.value?.deliveryAddress?.outerId ?? shipment.value?.pickupLocation?.id,
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

    openSelectAddressModal,
  };
}
