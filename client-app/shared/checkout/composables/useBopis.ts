import { computed } from "vue";
import { getPickupInStoreAddresses } from "@/core/api/graphql/shipment";
import { useFullCart } from "@/shared/cart/composables";
import { useModal } from "@/shared/modal";
import type { AnyAddressType } from "@/core/types";
import SelectAddressModal from "@/shared/checkout/components/select-address-modal.vue";

export const BOPIS_CODE = "BuyOnlinePickupInStore";

export function useBopis() {
  const { availableShippingMethods, updateShipment, shipment } = useFullCart();

  const { result, loading, error, load } = getPickupInStoreAddresses();

  const addresses = computed(() => result.value?.getPickupInStoreAddresses?.addresses ?? []);
  const hasBOPIS = computed(() => availableShippingMethods.value.some((method) => method.code === BOPIS_CODE));
  const bopisMethod = computed(() => availableShippingMethods.value.find((method) => method.code === BOPIS_CODE));

  async function fetchAddresses({ keyword, sort }: { keyword?: string; sort?: string } = {}) {
    await load(null, { keyword, sort });
  }

  const { openModal } = useModal();

  async function openSelectAddressModal() {
    if (!addresses.value.length) {
      await fetchAddresses();
    }

    openModal({
      component: SelectAddressModal,

      props: {
        addresses: addresses.value,
        currentAddress: shipment.value?.deliveryAddress,
        isCorporateAddresses: true,
        allowAddNewAddress: false,

        onResult: async (address: AnyAddressType) => {
          await updateShipment({
            id: shipment.value?.id,
            deliveryAddress: address,
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
