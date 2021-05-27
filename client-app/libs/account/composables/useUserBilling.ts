import { Ref, ref, computed } from "@vue/composition-api";
import { getMyAddresses } from "@core/api/graphql/account";
import { AddressType } from "@core/api/graphql/types";
import { Logger } from "@core/utilities";


export default () => {
  const loading: Ref<boolean> = ref(true);
  const billingAddresses: Ref<AddressType[]> = ref([]);

  async function loadMyAddresses(): Promise<void>  {
    loading.value = true;
    try {
      const addresses = await getMyAddresses();
      billingAddresses.value = addresses.filter(address => address.addressType === 1 || address.addressType === 3);
    } catch (e) {
      Logger.error("useUserBilling.loadMyAddresses", e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function addAddress(address: AddressType): Promise<void> {
    console.log("addAddress", address);
  }
  async function deleteAddress(address: AddressType): Promise<void> {
    console.log("deleteAddress", address);
  }
  async function updateAddress(address: AddressType): Promise<void> {
    console.log("updateAddress", address);
  }

  return {
    billingAddresses: computed(() => billingAddresses.value),
    addAddress,
    deleteAddress,
    updateAddress,
    loadMyAddresses
  };
};
