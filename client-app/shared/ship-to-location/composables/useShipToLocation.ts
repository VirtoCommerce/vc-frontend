import { useLocalStorage } from "@vueuse/core";
import { omit } from "lodash";
import { computed } from "vue";
import { XApiPermissions } from "@/core/enums";
import { useUser, useUserAddresses } from "@/shared/account";
import { useFullCart } from "@/shared/cart";
import { SelectAddressModal } from "@/shared/checkout";
import { AddOrUpdateCompanyAddressModal, useOrganizationAddresses } from "@/shared/company";
import { useModal } from "@/shared/modal";
import type { MemberAddressType } from "@/core/api/graphql/types";
import type { AnyAddressType } from "@/core/types";
import AddOrUpdateAddressModal from "@/shared/account/components/add-or-update-address-modal.vue";

export const MAX_ADDRESSES_NUMBER = 6;
export const USER_TYPE = {
  PERSONAL: "personal",
  CORPORATE_LIMITED: "corporate-limited",
  CORPORATE: "corporate",
  ANONYMOUS: "anonymous",
} as const;

type UserType = (typeof USER_TYPE)[keyof typeof USER_TYPE];

export function useShipToLocation() {
  const { openModal, closeModal } = useModal();
  const { loading: loadingUser, organization, isCorporateMember, isAuthenticated, checkPermissions } = useUser();
  const {
    addresses: personalAddresses,
    fetchAddresses: fetchPersonalAddresses,
    addOrUpdateAddresses: addOrUpdatePersonalAddresses,
    loading: loadingUserAddresses,
  } = useUserAddresses();

  const {
    addresses: organizationsAddresses,
    fetchAddresses: fetchOrganizationAddresses,
    loading: loadingOrganizationAddresses,
    addOrUpdateAddresses: addOrUpdateOrganizationAddresses,
  } = useOrganizationAddresses(organization.value?.id ?? "");

  const { updateShipment: updateShipmentCart, shipment: cartShipment } = useFullCart();

  const localShipToAddresses = useLocalStorage<AnyAddressType[]>("localShipToAddresses", []);
  const selectedLocalShipToAddressId = useLocalStorage<string | null>("selectedLocalShipToAddressId", null);

  const userType = computed<UserType>(() => {
    if (!isAuthenticated.value) {
      return USER_TYPE.ANONYMOUS;
    }

    if (isCorporateMember.value) {
      const canEditOrganization = checkPermissions(XApiPermissions.CanEditOrganization);

      return canEditOrganization ? USER_TYPE.CORPORATE : USER_TYPE.CORPORATE_LIMITED;
    }

    return USER_TYPE.PERSONAL;
  });

  const accountAddresses = computed<AnyAddressType[]>(() => {
    switch (userType.value) {
      case USER_TYPE.CORPORATE:
        return organizationsAddresses.value;
      case USER_TYPE.CORPORATE_LIMITED:
        return organizationsAddresses.value.length ? organizationsAddresses.value : localShipToAddresses.value;
      case USER_TYPE.PERSONAL:
        return personalAddresses.value;
      case USER_TYPE.ANONYMOUS:
        return localShipToAddresses.value;
      default:
        return [];
    }
  });

  const loading = computed(() => loadingUser.value || loadingOrganizationAddresses.value || loadingUserAddresses.value);

  const selectedAddress = computed(() => {
    if (userType.value === USER_TYPE.ANONYMOUS) {
      return localShipToAddresses.value.find((address) => address.id === selectedLocalShipToAddressId.value);
    }

    return cartShipment.value?.deliveryAddress; // TODO: refactor to use from GetMe
  });

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
    switch (userType.value) {
      case USER_TYPE.ANONYMOUS:
        break;
      case USER_TYPE.PERSONAL:
        await fetchPersonalAddresses();
        break;
      case USER_TYPE.CORPORATE:
      case USER_TYPE.CORPORATE_LIMITED:
        await fetchOrganizationAddresses();
        break;
    }
  }

  async function selectAddress(address: AnyAddressType) {
    switch (userType.value) {
      case USER_TYPE.CORPORATE: {
        // TODO: save to profile settings
        break;
      }
      case USER_TYPE.PERSONAL:
        // TODO: save to profile settings
        break;
      case USER_TYPE.ANONYMOUS:
      case USER_TYPE.CORPORATE_LIMITED:
        selectedLocalShipToAddressId.value = address.id;
        break;
    }

    await updateShipmentCart({
      id: cartShipment.value?.id,
      deliveryAddress: omit(address, ["isDefault", "isFavorite"]),
    });
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
      component: isCorporateMember.value ? AddOrUpdateCompanyAddressModal : AddOrUpdateAddressModal,
      props: {
        async onResult(address: MemberAddressType) {
          switch (userType.value) {
            case USER_TYPE.CORPORATE: {
              await addOrUpdateOrganizationAddresses([address]);
              break;
            }
            case USER_TYPE.PERSONAL:
              await addOrUpdatePersonalAddresses([address]);
              break;
            case USER_TYPE.CORPORATE_LIMITED:
            case USER_TYPE.ANONYMOUS: {
              address.id = crypto.randomUUID();
              localShipToAddresses.value = [...localShipToAddresses.value, address];
              break;
            }
          }

          closeModal();

          await selectAddress(address);
        },
      },
    });
  }

  return {
    accountAddresses,
    loading,
    selectedAddress,

    fetchAddresses,
    getFilteredAddresses,
    selectAddress,

    openSelectAddressModal,
    openAddOrUpdateAddressModal,
  };
}
