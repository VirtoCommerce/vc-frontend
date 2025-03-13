import { useLocalStorage } from "@vueuse/core";
import { omit } from "lodash";
import { computed } from "vue";
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
  ORGANIZATION: "organization",
  ANONYMOUS: "anonymous",
} as const;

type UserType = (typeof USER_TYPE)[keyof typeof USER_TYPE];

export function useBopis() {
  const { openModal, closeModal } = useModal();
  const { loading: loadingUser, organization, isCorporateMember, isAuthenticated } = useUser();
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

  const { updateShipment: updateShipmentCart, shipment: cartShipment, changing, forceFetch } = useFullCart();

  const anonymousAddresses = useLocalStorage<AnyAddressType[]>("anonymousShipToAddresses", []);
  const selectedAnonymousShipToAddressId = useLocalStorage<string | null>("selectedAnonymousShipToAddressId", null);

  const userType = computed<UserType>(() => {
    if (!isAuthenticated.value) {
      return USER_TYPE.ANONYMOUS;
    }

    if (isCorporateMember.value) {
      return USER_TYPE.ORGANIZATION;
    }

    return USER_TYPE.PERSONAL;
  });

  const accountAddresses = computed<AnyAddressType[]>(() => {
    switch (userType.value) {
      case USER_TYPE.ANONYMOUS:
        return anonymousAddresses.value;
      case USER_TYPE.ORGANIZATION:
        return organizationsAddresses.value;
      case USER_TYPE.PERSONAL:
        return personalAddresses.value;
      default:
        return [];
    }
  });

  const loading = computed(
    () => loadingUser.value || loadingOrganizationAddresses.value || loadingUserAddresses.value || changing.value,
  );

  const selectedAddress = computed(() => {
    if (userType.value === USER_TYPE.ANONYMOUS) {
      return anonymousAddresses.value.find((address) => address.id === selectedAnonymousShipToAddressId.value);
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
    void forceFetch(); // TODO: remove this ???

    switch (userType.value) {
      case USER_TYPE.ANONYMOUS:
        return;
      case USER_TYPE.ORGANIZATION:
        await fetchOrganizationAddresses();
        break;
      case USER_TYPE.PERSONAL:
        await fetchPersonalAddresses();
        break;
    }
  }

  async function selectAddress(address: AnyAddressType) {
    if (userType.value === USER_TYPE.ANONYMOUS) {
      selectedAnonymousShipToAddressId.value = address.id;
    } else {
      // TODO: save to profile settings
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
            case USER_TYPE.ORGANIZATION:
              await addOrUpdateOrganizationAddresses([address]);
              break;
            case USER_TYPE.PERSONAL:
              await addOrUpdatePersonalAddresses([address]);
              break;
            case USER_TYPE.ANONYMOUS:
              address.id = crypto.randomUUID();
              anonymousAddresses.value = [...anonymousAddresses.value, address];
              break;
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
