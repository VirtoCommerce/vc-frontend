import { createSharedComposable, useLocalStorage } from "@vueuse/core";
import { isEqual, omit } from "lodash-es";
import { computed, ref } from "vue";
import { updateContact, useGetCurrentCustomerAddressesQuery } from "@/core/api/graphql/account";
import { useGetCurrentOrganizationAddressesQuery } from "@/core/api/graphql/organization";
import { XApiPermissions } from "@/core/enums";
import { Logger, stringifyAddress } from "@/core/utilities";
import { useCustomerAddresses, useUser } from "@/shared/account";
import { useFullCart, useShortCart } from "@/shared/cart";
import { BOPIS_CODE } from "@/shared/checkout/composables/useBopis";
import { AddOrUpdateCompanyAddressModal, useCurrentOrganizationAddresses } from "@/shared/company";
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

/**
 * Composable for managing shipping locations and addresses.
 *
 * Shared across all call sites (`createSharedComposable`): the underlying `useCustomerAddresses`/
 * `useCurrentOrganizationAddresses` queries create fresh state per call, so without sharing, each
 * consumer (header ship-to selector, catalog, checkout shipping section) would fire its own
 * independent address query.
 */
function _useShipToLocation() {
  const updatingContact = ref(false);
  const { openModal, closeModal } = useModal();

  const {
    loading: loadingUser,
    organization,
    isCorporateMember,
    isAuthenticated,
    checkPermissions,
    user,
    fetchUser,
  } = useUser();

  const {
    addresses: personalAddresses,
    loading: loadingUserAddresses,
    page: personalPage,
    pages: personalPages,
    totalCount: personalTotalCount,
    keyword: personalKeyword,
    addOrUpdateAddresses: addOrUpdatePersonalAddresses,
  } = useCustomerAddresses(
    MAX_ADDRESSES_NUMBER,
    computed(() => isAuthenticated.value && !isCorporateMember.value),
  );

  const {
    addresses: organizationsAddresses,
    loading: loadingOrganizationAddresses,
    page: organizationPage,
    pages: organizationPages,
    totalCount: organizationTotalCount,
    keyword: organizationKeyword,
    addOrUpdateAddresses: addOrUpdateOrganizationAddresses,
  } = useCurrentOrganizationAddresses(
    () => organization.value?.id ?? "",
    MAX_ADDRESSES_NUMBER,
    computed(() => isAuthenticated.value && isCorporateMember.value),
  );

  const { updateShipment: updateShipmentCart, shipment: currentShipment, forceFetch: forceFetchCart } = useFullCart();
  const { cart: shortCart } = useShortCart();
  const cartShipmentId = computed(() => shortCart.value?.shipments[0]?.id);

  const localStorageKeyPrefix = "local_ship_to_";
  const userSuffix = computed(() => (isAuthenticated.value ? `_${user.value.id}` : "_anonymous"));
  const localShipToAddresses = useLocalStorage<AnyAddressType[]>(
    `${localStorageKeyPrefix}addresses${userSuffix.value}`,
    [],
  );
  const selectedLocalShipToAddressId = useLocalStorage<string | null>(
    `${localStorageKeyPrefix}selected_address_id${userSuffix.value}`,
    null,
  );

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

  // Pagination/search proxies for the server-backed cases (PERSONAL / CORPORATE). Not meaningful
  // for the local-storage fallback (ANONYMOUS / CORPORATE_LIMITED without org addresses), whose
  // small in-memory lists are filtered client-side instead - see getLocalFilteredAddresses.
  const page = computed<number>({
    get: () => (isCorporateMember.value ? organizationPage.value : personalPage.value),
    set: (value) => {
      if (isCorporateMember.value) {
        organizationPage.value = value;
      } else {
        personalPage.value = value;
      }
    },
  });

  const pages = computed(() => (isCorporateMember.value ? organizationPages.value : personalPages.value));

  const totalCount = computed(() =>
    isCorporateMember.value ? organizationTotalCount.value : personalTotalCount.value,
  );

  const keyword = computed<string>({
    get: () => (isCorporateMember.value ? organizationKeyword.value : personalKeyword.value),
    set: (value) => {
      if (isCorporateMember.value) {
        organizationPage.value = 1;
        organizationKeyword.value = value;
      } else {
        personalPage.value = 1;
        personalKeyword.value = value;
      }
    },
  });

  // True when accountAddresses is server-paginated (PERSONAL, or CORPORATE/CORPORATE_LIMITED with
  // organization address access) vs. sourced from the small local-storage list (ANONYMOUS, or
  // CORPORATE_LIMITED without organization address access).
  const isPaginated = computed(() => {
    if (userType.value === USER_TYPE.PERSONAL || userType.value === USER_TYPE.CORPORATE) {
      return true;
    }

    return userType.value === USER_TYPE.CORPORATE_LIMITED && organizationsAddresses.value.length > 0;
  });

  const selectedAddressId = computed(() => user.value?.contact?.selectedAddressId);

  // accountAddresses only holds the current page/search window for the paginated cases, so the
  // account's selected address may not be part of it (not on page 1, not favorite/first
  // alphabetically, or hidden behind an active keyword search). When that happens, resolve it
  // directly by id via a tiny dedicated query instead of loading the whole address book - this
  // works even before the cart (and its delivery address) has been fetched, e.g. on first paint
  // of the home page.
  const isSelectedAddressMissing = computed(() => {
    if (!isPaginated.value || !selectedAddressId.value) {
      return false;
    }

    // accountAddresses starts empty while the relevant paginated query is still in flight (e.g.
    // right after this shared composable is first created for the session) - wait for it to
    // settle before deciding the address is missing, otherwise this fires the dedicated lookup
    // below even when the address turns out to already be on the page.
    const mainListLoading = isCorporateMember.value ? loadingOrganizationAddresses.value : loadingUserAddresses.value;

    if (mainListLoading) {
      return false;
    }

    return !accountAddresses.value.some((address) => address.id === selectedAddressId.value);
  });

  const { result: personalSelectedAddressResult, loading: loadingPersonalSelectedAddress } =
    useGetCurrentCustomerAddressesQuery(
      computed(() => ({ first: 1, ids: [selectedAddressId.value ?? ""] })),
      computed(() => isSelectedAddressMissing.value && !isCorporateMember.value),
    );

  const { result: organizationSelectedAddressResult, loading: loadingOrganizationSelectedAddress } =
    useGetCurrentOrganizationAddressesQuery(
      computed(() => ({ first: 1, ids: [selectedAddressId.value ?? ""] })),
      computed(() => isSelectedAddressMissing.value && isCorporateMember.value),
    );

  const loading = computed(
    () =>
      loadingUser.value ||
      loadingOrganizationAddresses.value ||
      loadingUserAddresses.value ||
      updatingContact.value ||
      loadingPersonalSelectedAddress.value ||
      loadingOrganizationSelectedAddress.value,
  );

  function findSelectedAccountAddress(): AnyAddressType | undefined {
    const foundOnPage = accountAddresses.value.find((address) => address.id === selectedAddressId.value);

    if (foundOnPage) {
      return foundOnPage;
    }

    const resolvedById = isCorporateMember.value
      ? organizationSelectedAddressResult.value?.currentOrganizationAddresses?.items?.[0]
      : personalSelectedAddressResult.value?.currentCustomerAddresses?.items?.[0];

    if (resolvedById?.id === selectedAddressId.value) {
      return resolvedById;
    }

    // Last-resort fallback: the cart's already-loaded delivery address, in case it's ahead of the
    // dedicated lookup above (e.g. right after selecting an address, before its query settles).
    return currentShipment.value?.deliveryAddress?.id === selectedAddressId.value
      ? currentShipment.value?.deliveryAddress
      : undefined;
  }

  const selectedAddress = computed(() => {
    switch (userType.value) {
      case USER_TYPE.PERSONAL:
      case USER_TYPE.CORPORATE:
        return findSelectedAccountAddress();
      case USER_TYPE.CORPORATE_LIMITED:
        return organizationsAddresses.value.length
          ? findSelectedAccountAddress()
          : localShipToAddresses.value.find((address) => address.id === selectedLocalShipToAddressId.value);
      case USER_TYPE.ANONYMOUS:
        return localShipToAddresses.value.find((address) => address.id === selectedLocalShipToAddressId.value);
      default:
        return null;
    }
  });

  function normalizeAddressToFind(address: AnyAddressType): Partial<AnyAddressType> {
    return omit(address, ["id", "addressType", "regionName"]);
  }

  // Client-side filter/slice for the small local-storage address lists only (ANONYMOUS users,
  // and CORPORATE_LIMITED users without organization address access). These lists are never
  // fetched from the paginated backend, so filtering them in memory is fine.
  function getLocalFilteredAddresses(filter?: string): AnyAddressType[] {
    if (!filter) {
      return localShipToAddresses.value;
    }

    const lowerCaseStr = filter.toLowerCase();

    return localShipToAddresses.value.filter((address) =>
      stringifyAddress(address).toLowerCase().includes(lowerCaseStr),
    );
  }

  async function updateContactWithAddress(address: AnyAddressType) {
    if (!user.value?.contact || !address.id) {
      return;
    }

    try {
      updatingContact.value = true;
      await updateContact({
        id: user.value.contact.id,
        firstName: user.value.contact.firstName,
        lastName: user.value.contact.lastName,
        selectedAddressId: address.id,
      });
      await fetchUser({ withBroadcast: true });
    } catch (error) {
      Logger.error("updateContactWithAddress", error);
    } finally {
      updatingContact.value = false;
    }
  }

  async function selectAddress(address: AnyAddressType) {
    switch (userType.value) {
      case USER_TYPE.PERSONAL:
      case USER_TYPE.CORPORATE: {
        void updateContactWithAddress(address);
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

        void updateContactWithAddress(address);
        break;
      }
      case USER_TYPE.ANONYMOUS: {
        selectedLocalShipToAddressId.value = address.id;
        break;
      }
    }

    if (!currentShipment.value) {
      await forceFetchCart();
    }

    const isBopis = currentShipment.value?.shipmentMethodCode === BOPIS_CODE;

    if (!isBopis) {
      await updateShipmentCart({
        id: cartShipmentId.value,
        deliveryAddress: omit(address, ["isDefault", "isFavorite"]),
      });
    }
  }

  function openAddOrUpdateAddressModal() {
    const component = isCorporateMember.value ? AddOrUpdateCompanyAddressModal : AddOrUpdateAddressModal;

    openModal({
      component,
      props: {
        async onResult(address: MemberAddressType) {
          await handleAddressAddition(address);
          closeModal();
          await selectAddress(address);
        },
      },
    });
  }

  async function handleAddressAddition(address: MemberAddressType) {
    switch (userType.value) {
      case USER_TYPE.CORPORATE: {
        const updatedAddresses = await addOrUpdateOrganizationAddresses([address]);
        const justAddedAddress = updatedAddresses.find((_address) =>
          isEqual(normalizeAddressToFind(_address), normalizeAddressToFind(address)),
        );
        address.id = justAddedAddress?.id;
        break;
      }
      case USER_TYPE.PERSONAL: {
        const updatedAddresses = await addOrUpdatePersonalAddresses([address]);
        const justAddedAddress = updatedAddresses.find((_address) =>
          isEqual(normalizeAddressToFind(_address), normalizeAddressToFind(address)),
        );
        address.id = justAddedAddress?.id;
        break;
      }
      case USER_TYPE.CORPORATE_LIMITED:
      case USER_TYPE.ANONYMOUS: {
        address.id = `${LOCAL_ID_PREFIX}${crypto.randomUUID()}`;
        localShipToAddresses.value = [...localShipToAddresses.value, address];
        break;
      }
    }
  }

  return {
    accountAddresses,
    loading,
    selectedAddress,
    organizationsAddresses,
    isPaginated,

    page,
    pages,
    totalCount,
    keyword,

    selectAddress,

    getLocalFilteredAddresses,

    openAddOrUpdateAddressModal,
  };
}

export const useShipToLocation = createSharedComposable(_useShipToLocation);
