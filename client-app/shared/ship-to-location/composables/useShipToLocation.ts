import { createSharedComposable, useLocalStorage, watchDebounced } from "@vueuse/core";
import { omit, pickBy } from "lodash-es";
import { computed, ref, watch } from "vue";
import { updateContact, useGetCurrentCustomerAddressesQuery } from "@/core/api/graphql/account";
import { useGetCurrentOrganizationAddressesQuery } from "@/core/api/graphql/organization";
import { XApiPermissions } from "@/core/enums";
import { isEqualAddresses, Logger, stringifyAddress } from "@/core/utilities";
import { useCustomerAddresses, useUser } from "@/shared/account";
import { useFullCart, useShortCart } from "@/shared/cart";
import { BOPIS_CODE } from "@/shared/checkout/composables/useBopis";
import { AddOrUpdateCompanyAddressModal, useCurrentOrganizationAddresses } from "@/shared/company";
import { useModal } from "@/shared/modal";
import type { MemberAddressType } from "@/core/api/graphql/types";
import type { AnyAddressType } from "@/core/types";
import AddOrUpdateAddressModal from "@/shared/account/components/add-or-update-address-modal.vue";

export const MAX_ADDRESSES_NUMBER = 6;
const SEARCH_DEBOUNCE_IN_MS = 300;
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

  const personalAddressBook = useCustomerAddresses(
    MAX_ADDRESSES_NUMBER,
    computed(() => isAuthenticated.value && !isCorporateMember.value),
  );

  const organizationAddressBook = useCurrentOrganizationAddresses(
    () => organization.value?.id ?? "",
    MAX_ADDRESSES_NUMBER,
    computed(() => isAuthenticated.value && isCorporateMember.value),
  );

  const addressBook = computed(() => (isCorporateMember.value ? organizationAddressBook : personalAddressBook));

  const { updateShipment: updateShipmentCart, shipment: currentShipment, forceFetch: forceFetchCart } = useFullCart();
  const { cart: shortCart } = useShortCart();
  const cartShipmentId = computed(() => shortCart.value?.shipments[0]?.id);

  const localStorageKeyPrefix = "local_ship_to_";
  const userSuffix = computed(() => (isAuthenticated.value ? `_${user.value.id}` : "_anonymous"));
  // Keys are getters: the shared instance outlives a sign-in/out, so they must follow the current user.
  const localShipToAddresses = useLocalStorage<AnyAddressType[]>(
    () => `${localStorageKeyPrefix}addresses${userSuffix.value}`,
    [],
  );
  const selectedLocalShipToAddressId = useLocalStorage<string | null>(
    () => `${localStorageKeyPrefix}selected_address_id${userSuffix.value}`,
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

  const loadingAddresses = computed(() => addressBook.value.loading.value);
  const totalCount = computed(() => addressBook.value.totalCount.value);
  const keyword = computed(() => addressBook.value.keyword.value);

  // The search box value; keyword (what the server list is scoped to) follows it after a debounce.
  // Lives here rather than in the selector so a remounted selector (header <-> mobile header) keeps it.
  const search = ref<string | undefined>("");

  watchDebounced(
    search,
    (value) => {
      addressBook.value.page.value = 1;
      addressBook.value.keyword.value = value ?? "";
    },
    { debounce: SEARCH_DEBOUNCE_IN_MS },
  );

  const isSearchPending = computed(() => (search.value ?? "") !== keyword.value || loadingAddresses.value);

  // totalCount is scoped to the active search; this one is the size of the whole address book.
  const addressBookTotalCount = ref(0);

  watch(
    [totalCount, loadingAddresses],
    () => {
      if (!loadingAddresses.value && !keyword.value) {
        addressBookTotalCount.value = totalCount.value;
      }
    },
    { immediate: true },
  );

  // True when accountAddresses is the server-paginated address book (PERSONAL, CORPORATE, or
  // CORPORATE_LIMITED whose organization has addresses) vs. the small local-storage list (ANONYMOUS,
  // or CORPORATE_LIMITED whose organization has none).
  const isPaginated = computed(() => {
    switch (userType.value) {
      case USER_TYPE.PERSONAL:
      case USER_TYPE.CORPORATE:
        return true;
      case USER_TYPE.CORPORATE_LIMITED:
        return addressBookTotalCount.value > 0;
      default:
        return false;
    }
  });

  const accountAddresses = computed<AnyAddressType[]>(() => {
    if (!isPaginated.value) {
      return localShipToAddresses.value;
    }

    return addressBook.value.addresses.value;
  });

  const addressesCount = computed(() =>
    isPaginated.value ? addressBookTotalCount.value : localShipToAddresses.value.length,
  );

  const canAddNewAddress = computed(() => userType.value !== USER_TYPE.CORPORATE_LIMITED || !isPaginated.value);

  const page = computed<number>({
    get: () => addressBook.value.page.value,
    set: (value) => {
      addressBook.value.page.value = value;
    },
  });

  const pages = computed(() => addressBook.value.pages.value);

  const selectedAddressId = computed(() => user.value?.contact?.selectedAddressId);

  // accountAddresses is only the current page/search result, so the selected address is resolved
  // by id. Enabled on the id alone: its variables change only with the id, so it never refires
  // on page or search changes.
  const selectedAddressVariables = computed(() => ({ first: 1, ids: [selectedAddressId.value ?? ""] }));

  const { result: personalSelectedAddressResult } = useGetCurrentCustomerAddressesQuery(
    selectedAddressVariables,
    computed(() => isPaginated.value && !isCorporateMember.value && !!selectedAddressId.value),
  );

  const { result: organizationSelectedAddressResult } = useGetCurrentOrganizationAddressesQuery(
    selectedAddressVariables,
    computed(() => isPaginated.value && isCorporateMember.value && !!selectedAddressId.value),
  );

  const loading = computed(() => loadingUser.value || loadingAddresses.value || updatingContact.value);

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

    // The cart's delivery address can be ahead of the lookup above (right after selecting an address).
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
        return isPaginated.value
          ? findSelectedAccountAddress()
          : localShipToAddresses.value.find((address) => address.id === selectedLocalShipToAddressId.value);
      case USER_TYPE.ANONYMOUS:
        return localShipToAddresses.value.find((address) => address.id === selectedLocalShipToAddressId.value);
      default:
        return null;
    }
  });

  // The mutation response carries server-only fields (__typename, isDefault…) and may return empty
  // optional fields as null where the form keeps "", so compare only the filled address fields.
  function isSameAddress(address1: AnyAddressType, address2: AnyAddressType): boolean {
    const withoutEmptyFields = (address: AnyAddressType) =>
      pickBy(address, (value) => value !== null && value !== "") as AnyAddressType;

    return isEqualAddresses(withoutEmptyFields(address1), withoutEmptyFields(address2));
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
        if (!isPaginated.value) {
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
      case USER_TYPE.CORPORATE:
      case USER_TYPE.PERSONAL: {
        const updatedAddresses = await addressBook.value.addOrUpdateAddresses([address]);
        const justAddedAddress = updatedAddresses.find((updatedAddress) => isSameAddress(updatedAddress, address));
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
    addressesCount,
    canAddNewAddress,
    loading,
    selectedAddress,
    isPaginated,

    page,
    pages,
    search,
    isSearchPending,

    selectAddress,

    getLocalFilteredAddresses,

    openAddOrUpdateAddressModal,
  };
}

export const useShipToLocation = createSharedComposable(_useShipToLocation);
