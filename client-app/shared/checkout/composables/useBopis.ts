import { computed } from "vue";
import { getPickupInStoreAddresses } from "@/core/api/graphql/shipment";
import { globals } from "@/core/globals";
import { useFullCart } from "@/shared/cart/composables";
import { useModal } from "@/shared/modal";
import type { PickupLocationsType } from "@/core/api/graphql/types";
import type { AnyAddressType } from "@/core/types";
import SelectAddressModal from "@/shared/checkout/components/select-address-modal.vue";

export const BOPIS_CODE = "BuyOnlinePickupInStore";

const ADDRESSES_FETCH_LIMIT = 999;

export function useBopis() {
  const { availableShippingMethods, updateShipment, shipment } = useFullCart();

  const { result, loading, error, load } = getPickupInStoreAddresses();

  const addresses = computed<PickupLocationsType[]>(
    () => (result.value?.getPickupInStoreAddresses?.items as PickupLocationsType[]) ?? ([] as PickupLocationsType[]),
  );
  const hasBOPIS = computed(() => availableShippingMethods.value.some((method) => method.code === BOPIS_CODE));
  const bopisMethod = computed(() => availableShippingMethods.value.find((method) => method.code === BOPIS_CODE));

  const normalizedAddresses = computed<AnyAddressType[]>(() =>
    addresses.value.map((pickupInStoreAddress) => ({
      ...pickupInStoreAddress.address,
      description: pickupInStoreAddress.name,
    })),
  );

  async function fetchAddresses({
    keyword,
    sort,
    first,
    after,
  }: { keyword?: string; sort?: string; first?: number; after?: string } = {}) {
    await load(null, { storeId: globals.storeId, keyword, sort, first, after });
  }

  const { openModal } = useModal();

  async function openSelectAddressModal() {
    if (!addresses.value.length) {
      await fetchAddresses({ first: ADDRESSES_FETCH_LIMIT });
    }

    openModal({
      component: SelectAddressModal,

      props: {
        addresses: normalizedAddresses.value,
        currentAddress: {
          ...shipment.value?.deliveryAddress,
          id: shipment.value?.deliveryAddress?.outerId,
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
        ],
        isCorporateAddresses: true,
        allowAddNewAddress: false,

        onResult: async (address: AnyAddressType) => {
          await updateShipment({
            id: shipment.value?.id,
            deliveryAddress: {
              ...address,
              outerId: address.id,
            },
          });
        },
      },
    });
  }

  return {
    addresses,
    bopisMethod,
    hasBOPIS,

    loading,
    error,

    fetchAddresses,
    openSelectAddressModal,
  };
}
