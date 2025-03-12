import { computed } from "vue";
import { useUser, useUserAddresses } from "@/shared/account";
import { useFullCart } from "@/shared/cart";
import { SelectAddressModal } from "@/shared/checkout";
import { useOrganizationAddresses } from "@/shared/company";
import { useModal } from "@/shared/modal";
import type { AnyAddressType } from "@/core/types";
import AddOrUpdateAddressModal from "@/shared/account/components/add-or-update-address-modal.vue";

const MAX_ADDRESSES_NUMBER = 6;

export function useBopis() {
  const { openModal, closeModal } = useModal();
  const { loading: loadingUser, organization, isCorporateMember, isAuthenticated } = useUser();
  const {
    addresses: personalAddresses,
    fetchAddresses: fetchPersonalAddresses,
    loading: loadingUserAddressses,
  } = useUserAddresses();

  const {
    addresses: organizationsAddresses,
    fetchAddresses: fetchOrganizationAddresses,
    loading: loadingOrganizationAddresses,
  } = useOrganizationAddresses(organization.value!.id);

  const accountAddresses = computed<AnyAddressType[]>(() =>
    isCorporateMember.value ? organizationsAddresses.value : personalAddresses.value,
  );

  const { saveShipToAddress, changing, addresses: cartAddresses, forceFetch } = useFullCart();

  const loading = computed(
    () => loadingUser.value || loadingOrganizationAddresses.value || loadingUserAddressses.value || changing.value,
  );

  const selectedAddress = computed(() => cartAddresses.value[0]);

  function getFilteredAddresses(isSeeMore: boolean, filter?: string) {
    return filter || isSeeMore
      ? filterAddresses(accountAddresses.value, filter)
      : accountAddresses.value.slice(0, MAX_ADDRESSES_NUMBER);
  }

  function filterAddresses(addresses: AnyAddressType[], filter?: string): AnyAddressType[] {
    if (!filter) {
      return addresses;
    }

    const lowerCaseStr = filter.toLowerCase();

    return accountAddresses.value.filter((address) => {
      const combinedAddressString = [
        address.line1,
        address.line2,
        address.city,
        address.regionName,
        address.countryName,
        address.postalCode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return combinedAddressString.includes(lowerCaseStr);
    });
  }

  async function fetchAddresses(): Promise<void> {
    if (!isAuthenticated.value) {
      return;
    }

    void forceFetch();

    if (isCorporateMember.value) {
      await fetchOrganizationAddresses();
    } else {
      await fetchPersonalAddresses();
    }
  }

  async function selectAddress(address: AnyAddressType) {
    await saveShipToAddress(address);
  }

  function openSelectAddressModal(): void {
    openModal({
      component: SelectAddressModal,

      props: {
        addresses: accountAddresses.value,
        currentAddress: selectedAddress.value,
        isCorporateAddresses: isCorporateMember.value,

        async onResult(address?: AnyAddressType) {
          if (!address) {
            return;
          }

          await selectAddress(address);
        },

        onAddNewAddress() {
          setTimeout(() => {
            openAddOrUpdateAddressModal();
          }, 500);
        },
      },
    });
  }

  function openAddOrUpdateAddressModal(): void {
    openModal({
      component: AddOrUpdateAddressModal,
      props: {
        async onResult(address: AnyAddressType) {
          closeModal();

          await selectAddress(address);
        },
      },
    });
  }

  return {
    selectedAddress,
    accountAddresses,
    getFilteredAddresses,
    fetchAddresses,
    selectAddress,
    loading,
    openSelectAddressModal,
    openAddOrUpdateAddressModal,
  };
}
