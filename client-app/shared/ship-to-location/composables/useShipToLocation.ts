import { useLocalStorage } from "@vueuse/core";
import { omit } from "lodash";
import { computed } from "vue";
import { updateContact } from "@/core/api/graphql/account";
import { XApiPermissions } from "@/core/enums";
import { Logger, stringifyAddress } from "@/core/utilities";
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

export const LOCAL_ID_PREFIX = "local-";

type UserType = (typeof USER_TYPE)[keyof typeof USER_TYPE];

export function useShipToLocation() {
  const { openModal, closeModal } = useModal();
  const { loading: loadingUser, organization, isCorporateMember, isAuthenticated, checkPermissions, user } = useUser();
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
    switch (userType.value) {
      case USER_TYPE.PERSONAL:
      case USER_TYPE.CORPORATE:
        return accountAddresses.value.find((address) => address.id === user.value?.contact?.selectedAddressId);
      case USER_TYPE.CORPORATE_LIMITED:
        return (
          accountAddresses.value.find((address) => address.id === user.value?.contact?.selectedAddressId) ??
          localShipToAddresses.value.find((address) => address.id === selectedLocalShipToAddressId.value)
        );
      case USER_TYPE.ANONYMOUS:
        return localShipToAddresses.value.find((address) => address.id === selectedLocalShipToAddressId.value);
      default:
        return null;
    }
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
      const combinedAddressString = stringifyAddress(address).toLowerCase();

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
      case USER_TYPE.PERSONAL:
      case USER_TYPE.CORPORATE: {
        await updateContactWithAddress(address);
        break;
      }
      case USER_TYPE.CORPORATE_LIMITED: {
        const isOrganizationAddress = organizationsAddresses.value.some(
          (organizationAddress) => organizationAddress.id === address.id,
        );

        if (!isOrganizationAddress) {
          selectedLocalShipToAddressId.value = address.id;
          break;
        }

        await updateContactWithAddress(address);
        break;
      }
      case USER_TYPE.ANONYMOUS: {
        selectedLocalShipToAddressId.value = address.id;
        break;
      }
    }

    await updateShipmentCart({
      id: cartShipment.value?.id,
      deliveryAddress: omit(address, ["isDefault", "isFavorite"]),
    });
  }

  async function updateContactWithAddress(address: AnyAddressType) {
    if (!user.value?.contact) {
      return;
    }
    try {
      await updateContact({
        id: user.value.contact.id,
        firstName: user.value.contact.firstName,
        lastName: user.value.contact.lastName,
        selectedAddressId: address.id,
      });
    } catch (error) {
      Logger.error("updateContactWithAddress", error);
    }
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
              address.id = `${LOCAL_ID_PREFIX}${crypto.randomUUID()}`;
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
