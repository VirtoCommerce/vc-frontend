import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { computed, nextTick, ref, toValue } from "vue";
import { useShipToLocation } from "./useShipToLocation";
import type { AnyAddressType } from "@/core/types";
import type { ComputedRef, MaybeRefOrGetter } from "vue";

// Use vi.hoisted() to properly hoist mock functions
const openModalMock = vi.hoisted(() => vi.fn());
const closeModalMock = vi.hoisted(() => vi.fn());
const checkPermissionsMock = vi.hoisted(() => vi.fn());
const addOrUpdatePersonalAddressesMock = vi.hoisted(() => vi.fn().mockResolvedValue([]));
const addOrUpdateOrganizationAddressesMock = vi.hoisted(() => vi.fn().mockResolvedValue([]));
const updateShipmentMock = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const updateContactMock = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const useCustomerAddressesMock = vi.hoisted(() => vi.fn());
const useCurrentOrganizationAddressesMock = vi.hoisted(() => vi.fn());
const useGetCurrentCustomerAddressesQueryMock = vi.hoisted(() => vi.fn());
const useGetCurrentOrganizationAddressesQueryMock = vi.hoisted(() => vi.fn());

// Module mocks
vi.mock("@/shared/modal", () => ({
  useModal: () => ({
    openModal: openModalMock,
    closeModal: closeModalMock,
  }),
}));

vi.mock("@/core/api/graphql/account", () => ({
  updateContact: updateContactMock,
  useGetCurrentCustomerAddressesQuery: useGetCurrentCustomerAddressesQueryMock,
}));

vi.mock("@/core/api/graphql/organization", () => ({
  useGetCurrentOrganizationAddressesQuery: useGetCurrentOrganizationAddressesQueryMock,
}));

vi.mock("@/shared/account", () => ({
  useUser: () => ({
    isAuthenticated,
    isCorporateMember,
    loading: loadingUser,
    organization,
    checkPermissions: checkPermissionsMock,
    user,
  }),
  useCustomerAddresses: useCustomerAddressesMock,
}));

vi.mock("@/shared/company", () => ({
  useCurrentOrganizationAddresses: useCurrentOrganizationAddressesMock,
  AddOrUpdateCompanyAddressModal: { name: "AddOrUpdateCompanyAddressModal" },
}));

vi.mock("@/shared/cart", () => ({
  useFullCart: () => ({
    updateShipment: updateShipmentMock,
    shipment,
    forceFetch: vi.fn(),
  }),
  useShortCart: () => ({
    cart: ref({ shipments: [{ id: "shipment1" }] }),
  }),
}));

vi.mock("@vueuse/core", async () => {
  const actual = await vi.importActual("@vueuse/core");
  return {
    ...actual,
    // useShipToLocation is wrapped in createSharedComposable in production so all consumers share
    // one address query; that sharing (never disposed outside a component context) would leak
    // state across `it()` blocks here, so tests exercise the raw, unshared factory instead.
    createSharedComposable: <T extends (...args: never[]) => unknown>(fn: T) => fn,
    useLocalStorage: <T>(key: MaybeRefOrGetter<string>, initialValue: T) =>
      computed({
        get() {
          return getLocalStorageValue(toValue(key)) ?? initialValue;
        },
        set(value: T) {
          setLocalStorageValue(toValue(key), value as [AnyAddressType] | string | null);
        },
      }),
  };
});

// Also, mock AddOrUpdateAddressModal component
vi.mock("@/shared/account/components/add-or-update-address-modal.vue", () => ({
  default: { name: "AddOrUpdateAddressModal" },
}));

// Import after mocks are defined

interface IModalOptions {
  component: { name: string };
  props: {
    onResult: (address: AnyAddressType) => Promise<void> | void;
  };
}

// Reactive mocks
const isAuthenticated = ref(true);
const isCorporateMember = ref(false);
const loadingUser = ref(false);
const organization = ref({ id: "org1" });
const user = ref<{
  id?: string;
  contact?: {
    id: string;
    firstName: string;
    lastName: string;
    selectedAddressId: string;
  };
}>({
  id: "user1",
  contact: {
    id: "contact1",
    firstName: "John",
    lastName: "Doe",
    selectedAddressId: "addr1",
  },
});

const personalAddresses = ref<AnyAddressType[]>([]);
const personalAddressesLoading = ref(false);
const personalPage = ref(1);
const personalPages = ref(1);
const personalTotalCount = ref(0);
const personalKeyword = ref("");

const organizationAddresses = ref<AnyAddressType[]>([]);
const organizationAddressesLoading = ref(false);
const organizationPage = ref(1);
const organizationPages = ref(1);
const organizationTotalCount = ref(0);
const organizationKeyword = ref("");

let personalQueryEnabled: ComputedRef<boolean> | undefined;
let organizationQueryEnabled: ComputedRef<boolean> | undefined;

useCustomerAddressesMock.mockImplementation((_itemsPerPage: unknown, queryEnabled: ComputedRef<boolean>) => {
  personalQueryEnabled = queryEnabled;
  return {
    addresses: personalAddresses,
    loading: personalAddressesLoading,
    page: personalPage,
    pages: personalPages,
    totalCount: personalTotalCount,
    keyword: personalKeyword,
    addOrUpdateAddresses: addOrUpdatePersonalAddressesMock,
  };
});

useCurrentOrganizationAddressesMock.mockImplementation(
  (_organizationId: unknown, _itemsPerPage: unknown, queryEnabled: ComputedRef<boolean>) => {
    organizationQueryEnabled = queryEnabled;
    return {
      addresses: organizationAddresses,
      loading: organizationAddressesLoading,
      page: organizationPage,
      pages: organizationPages,
      totalCount: organizationTotalCount,
      keyword: organizationKeyword,
      addOrUpdateAddresses: addOrUpdateOrganizationAddressesMock,
    };
  },
);

// Dedicated "resolve selected address by id" lookups used when it's not on the current page.
const selectedPersonalAddressResult = ref<{ currentCustomerAddresses?: { items?: AnyAddressType[] } } | undefined>(
  undefined,
);
const selectedPersonalAddressLoading = ref(false);
const selectedOrganizationAddressResult = ref<
  { currentOrganizationAddresses?: { items?: AnyAddressType[] } } | undefined
>(undefined);
const selectedOrganizationAddressLoading = ref(false);

let personalSelectedAddressQueryEnabled: ComputedRef<boolean> | undefined;
let organizationSelectedAddressQueryEnabled: ComputedRef<boolean> | undefined;

useGetCurrentCustomerAddressesQueryMock.mockImplementation(
  (_variables: unknown, queryEnabled: ComputedRef<boolean>) => {
    personalSelectedAddressQueryEnabled = queryEnabled;
    return {
      result: selectedPersonalAddressResult,
      loading: selectedPersonalAddressLoading,
    };
  },
);

useGetCurrentOrganizationAddressesQueryMock.mockImplementation(
  (_variables: unknown, queryEnabled: ComputedRef<boolean>) => {
    organizationSelectedAddressQueryEnabled = queryEnabled;
    return {
      result: selectedOrganizationAddressResult,
      loading: selectedOrganizationAddressLoading,
    };
  },
);

const localShipToAddressesData = ref<Record<string, AnyAddressType[]>>({});
const selectedLocalShipToAddressIdData = ref<Record<string, string | null>>({});

function setLocalStorageValue(key: string, value: [AnyAddressType] | string | null) {
  if (key.includes("local_ship_to_addresses")) {
    const id = key.replace("local_ship_to_addresses_", "");
    localShipToAddressesData.value[id] = value as [AnyAddressType];
  }
  if (key.includes("local_ship_to_selected_address_id")) {
    const id = key.replace("local_ship_to_selected_address_id_", "");
    selectedLocalShipToAddressIdData.value[id] = value as string | null;
  }
}

function getLocalStorageValue(key: string) {
  if (key.includes("local_ship_to_addresses")) {
    const id = key.replace("local_ship_to_addresses_", "");
    return localShipToAddressesData.value[id] ?? null;
  }
  if (key.includes("local_ship_to_selected_address_id")) {
    const id = key.replace("local_ship_to_selected_address_id_", "");
    return selectedLocalShipToAddressIdData.value[id] ?? null;
  }
  return null;
}

// Cart mocks
const shipment = ref<{ id: string; deliveryAddress: AnyAddressType }>({
  id: "shipment1",
  deliveryAddress: { id: "addr1" },
});

describe("useShipToLocation composable", () => {
  beforeEach(() => {
    // Reset mocks and reactive state
    openModalMock.mockClear();
    closeModalMock.mockClear();
    checkPermissionsMock.mockClear();
    useCustomerAddressesMock.mockClear();
    useCurrentOrganizationAddressesMock.mockClear();
    addOrUpdatePersonalAddressesMock.mockClear();
    addOrUpdateOrganizationAddressesMock.mockClear();
    updateShipmentMock.mockClear();
    updateContactMock.mockClear();

    isAuthenticated.value = true;
    isCorporateMember.value = false;
    loadingUser.value = false;
    organization.value = { id: "org1" };
    user.value = {
      id: "user1",
      contact: {
        id: "contact1",
        firstName: "John",
        lastName: "Doe",
        selectedAddressId: "addr1",
      },
    };

    personalAddresses.value = [
      {
        id: "addr1",
        line1: "Test Address",
        line2: "",
        city: "City",
        regionName: "Region",
        countryName: "Country",
        postalCode: "0000",
      },
    ];

    organizationAddresses.value = [
      {
        id: "orgAddr1",
        line1: "Org Address",
        line2: "",
        city: "OrgCity",
        regionName: "OrgRegion",
        countryName: "OrgCountry",
        postalCode: "1111",
      },
    ];

    personalAddressesLoading.value = false;
    organizationAddressesLoading.value = false;
    personalPage.value = 1;
    organizationPage.value = 1;
    personalPages.value = 1;
    organizationPages.value = 1;
    personalTotalCount.value = 1;
    organizationTotalCount.value = 1;
    personalKeyword.value = "";
    organizationKeyword.value = "";
    localShipToAddressesData.value = {};
    selectedLocalShipToAddressIdData.value = {};
    shipment.value = { id: "shipment1", deliveryAddress: { id: "addr1" } };
    checkPermissionsMock.mockReturnValue(false);
    selectedPersonalAddressResult.value = undefined;
    selectedPersonalAddressLoading.value = false;
    selectedOrganizationAddressResult.value = undefined;
    selectedOrganizationAddressLoading.value = false;
  });

  describe("User Type & Address Query Enablement", () => {
    it("computes user type as personal when authenticated and not corporate", () => {
      const { accountAddresses } = useShipToLocation();
      expect(accountAddresses.value).toEqual(personalAddresses.value);
    });

    it("enables the personal addresses query and disables the organization one for a personal user", () => {
      useShipToLocation();

      expect(personalQueryEnabled?.value).toBe(true);
      expect(organizationQueryEnabled?.value).toBe(false);
    });

    it("enables the organization addresses query and disables the personal one for a corporate user", () => {
      isCorporateMember.value = true;
      checkPermissionsMock.mockReturnValue(true);

      useShipToLocation();

      expect(organizationQueryEnabled?.value).toBe(true);
      expect(personalQueryEnabled?.value).toBe(false);
    });

    it("disables both addresses queries for an anonymous user", () => {
      isAuthenticated.value = false;

      useShipToLocation();

      expect(personalQueryEnabled?.value).toBe(false);
      expect(organizationQueryEnabled?.value).toBe(false);
    });
  });

  describe("Local Address Filtering (anonymous / local fallback)", () => {
    it("returns all local addresses when no filter is provided", () => {
      isAuthenticated.value = false;
      setLocalStorageValue("local_ship_to_addresses_anonymous", [
        {
          id: "addr1",
          line1: "123 New York Street",
          line2: "",
          city: "New York",
          regionName: "NY",
          countryName: "USA",
          postalCode: "10001",
        },
        {
          id: "addr2",
          line1: "456 Boston Ave",
          line2: "",
          city: "Boston",
          regionName: "MA",
          countryName: "USA",
          postalCode: "02108",
        },
      ] as unknown as [AnyAddressType]);

      const { getLocalFilteredAddresses } = useShipToLocation();
      expect(getLocalFilteredAddresses()).toHaveLength(2);
    });

    it("filters local addresses correctly when a filter is provided", () => {
      isAuthenticated.value = false;
      setLocalStorageValue("local_ship_to_addresses_anonymous", [
        {
          id: "addr1",
          line1: "123 New York Street",
          line2: "",
          city: "New York",
          regionName: "NY",
          countryName: "USA",
          postalCode: "10001",
        },
        {
          id: "addr2",
          line1: "456 Boston Ave",
          line2: "",
          city: "Boston",
          regionName: "MA",
          countryName: "USA",
          postalCode: "02108",
        },
      ] as unknown as [AnyAddressType]);

      const { getLocalFilteredAddresses } = useShipToLocation();
      const result = getLocalFilteredAddresses("New York");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("addr1");
    });

    it("returns an empty array when no local address matches the filter", () => {
      isAuthenticated.value = false;
      setLocalStorageValue("local_ship_to_addresses_anonymous", [
        {
          id: "addr1",
          line1: "Some Address",
          line2: "",
          city: "City",
          regionName: "Region",
          countryName: "Country",
          postalCode: "0000",
        },
      ] as unknown as [AnyAddressType]);

      const { getLocalFilteredAddresses } = useShipToLocation();
      expect(getLocalFilteredAddresses("NonExistent")).toEqual([]);
    });
  });

  describe("Address Selection", () => {
    it("updates local selected address and calls updateShipment when selectAddress is called for anonymous", async () => {
      // Set user as anonymous
      isAuthenticated.value = false;
      const dummyAddress: AnyAddressType = {
        id: "anonAddr1",
        line1: "Anon Address",
        line2: "",
        city: "City",
        regionName: "Region",
        countryName: "Country",
        postalCode: "0000",
      };

      const { selectAddress } = useShipToLocation();
      await selectAddress(dummyAddress);

      expect(getLocalStorageValue("local_ship_to_selected_address_id_anonymous")).toBe("anonAddr1");

      expect(updateShipmentMock).toHaveBeenCalledWith({
        id: shipment.value.id,
        deliveryAddress: dummyAddress,
      });

      expect(updateContactMock).not.toHaveBeenCalled();
    });

    it("calls updateContact when selectAddress is called for personal user", async () => {
      // For personal user
      isAuthenticated.value = true;
      isCorporateMember.value = false;
      const dummyAddress: AnyAddressType = {
        id: "personal1",
        line1: "Personal Address",
        line2: "",
        city: "City",
        regionName: "Region",
        countryName: "Country",
        postalCode: "0000",
      };
      const { selectAddress } = useShipToLocation();
      await selectAddress(dummyAddress);

      expect(updateContactMock).toHaveBeenCalledWith({
        id: user.value.contact!.id,
        firstName: user.value.contact!.firstName,
        lastName: user.value.contact!.lastName,
        selectedAddressId: dummyAddress.id,
      });

      expect(updateShipmentMock).toHaveBeenCalledWith({
        id: shipment.value.id,
        deliveryAddress: dummyAddress,
      });
    });

    it("calls updateContact when selectAddress is called for corporate user", async () => {
      // For corporate user
      isAuthenticated.value = true;
      isCorporateMember.value = true;
      checkPermissionsMock.mockReturnValue(true);

      const dummyAddress: AnyAddressType = {
        id: "corporate1",
        line1: "Corporate Address",
        line2: "",
        city: "City",
        regionName: "Region",
        countryName: "Country",
        postalCode: "0000",
      };

      const { selectAddress } = useShipToLocation();
      await selectAddress(dummyAddress);

      expect(updateContactMock).toHaveBeenCalledWith({
        id: user.value.contact!.id,
        firstName: user.value.contact!.firstName,
        lastName: user.value.contact!.lastName,
        selectedAddressId: dummyAddress.id,
      });

      expect(updateShipmentMock).toHaveBeenCalledWith({
        id: shipment.value.id,
        deliveryAddress: dummyAddress,
      });
    });

    it("handles corporate-limited user with organization address correctly", async () => {
      // For corporate-limited user
      isAuthenticated.value = true;
      isCorporateMember.value = true;
      checkPermissionsMock.mockReturnValue(false);

      // Use an address that exists in organization addresses
      const orgAddress = organizationAddresses.value[0];

      const { selectAddress } = useShipToLocation();
      await selectAddress(orgAddress);

      // Should call updateContact since it's an organization address
      expect(updateContactMock).toHaveBeenCalledWith({
        id: user.value.contact!.id,
        firstName: user.value.contact!.firstName,
        lastName: user.value.contact!.lastName,
        selectedAddressId: orgAddress.id,
      });

      expect(updateShipmentMock).toHaveBeenCalledWith({
        id: shipment.value.id,
        deliveryAddress: orgAddress,
      });
    });

    it("handles corporate-limited user with local address correctly", async () => {
      // Corporate-limited user whose organization has no addresses
      isAuthenticated.value = true;
      isCorporateMember.value = true;
      checkPermissionsMock.mockReturnValue(false);
      organizationAddresses.value = [];
      organizationTotalCount.value = 0;

      // Use a local address that doesn't exist in organization addresses
      const localAddress: AnyAddressType = {
        id: "localCorpLimited",
        line1: "Local Corp Limited Address",
        line2: "",
        city: "City",
        regionName: "Region",
        countryName: "Country",
        postalCode: "0000",
      };

      const { selectAddress } = useShipToLocation();
      await selectAddress(localAddress);

      // Should not call updateContact since it's a local address
      expect(updateContactMock).not.toHaveBeenCalled();

      // Should update local storage
      expect(getLocalStorageValue("local_ship_to_selected_address_id_user1")).toBe("localCorpLimited");

      expect(updateShipmentMock).toHaveBeenCalledWith({
        id: shipment.value.id,
        deliveryAddress: localAddress,
      });
    });

    it("computes selectedAddress correctly for personal user", async () => {
      isAuthenticated.value = true;
      isCorporateMember.value = false;
      user.value.contact!.selectedAddressId = "addr1";

      const { selectedAddress } = useShipToLocation();
      await nextTick();

      expect(selectedAddress.value).toEqual(personalAddresses.value[0]);
    });

    it("resolves the selected address via the dedicated ids lookup when it's not on the currently loaded page", async () => {
      // personalAddresses only represents the current page - simulate the selected address
      // living on a different page by pointing selectedAddressId at an id absent from it. The
      // cart hasn't loaded a matching delivery address either (e.g. home page, cart not fetched
      // yet), so only the ids-based lookup can resolve it.
      isAuthenticated.value = true;
      isCorporateMember.value = false;
      user.value.contact!.selectedAddressId = "addrOnAnotherPage";
      shipment.value = { id: "shipment1", deliveryAddress: { id: "addr1" } };

      const resolvedAddress: AnyAddressType = {
        id: "addrOnAnotherPage",
        line1: "Address From Another Page",
        line2: "",
        city: "City",
        regionName: "Region",
        countryName: "Country",
        postalCode: "0000",
      };
      selectedPersonalAddressResult.value = { currentCustomerAddresses: { items: [resolvedAddress] } };

      const { selectedAddress } = useShipToLocation();
      await nextTick();

      expect(selectedAddress.value).toEqual(resolvedAddress);
    });

    it("keeps the ids lookup enabled while the address list is loading another page", async () => {
      isAuthenticated.value = true;
      isCorporateMember.value = false;
      user.value.contact!.selectedAddressId = "addr1";

      useShipToLocation();
      expect(personalSelectedAddressQueryEnabled?.value).toBe(true);

      personalAddresses.value = [];
      personalAddressesLoading.value = true;
      await nextTick();

      expect(personalSelectedAddressQueryEnabled?.value).toBe(true);
    });

    it("disables the ids lookup when no address is selected", () => {
      user.value.contact!.selectedAddressId = "";

      useShipToLocation();

      expect(personalSelectedAddressQueryEnabled?.value).toBe(false);
    });

    it("enables the organization ids lookup once the org page has loaded and doesn't contain the selected address", async () => {
      isAuthenticated.value = true;
      isCorporateMember.value = true;
      checkPermissionsMock.mockReturnValue(true);
      user.value.contact!.selectedAddressId = "orgAddrOnAnotherPage";
      organizationAddressesLoading.value = false;

      useShipToLocation();
      await nextTick();

      expect(organizationSelectedAddressQueryEnabled?.value).toBe(true);
    });

    it("resolves the selected organization address via the organization ids lookup", async () => {
      isCorporateMember.value = true;
      checkPermissionsMock.mockReturnValue(true);
      user.value.contact!.selectedAddressId = "orgAddrOnAnotherPage";

      const resolvedAddress: AnyAddressType = { id: "orgAddrOnAnotherPage", line1: "Org Address From Another Page" };
      selectedOrganizationAddressResult.value = { currentOrganizationAddresses: { items: [resolvedAddress] } };
      selectedPersonalAddressResult.value = {
        currentCustomerAddresses: { items: [{ id: "orgAddrOnAnotherPage", line1: "Wrong Source" }] },
      };

      const { selectedAddress } = useShipToLocation();
      await nextTick();

      expect(selectedAddress.value).toEqual(resolvedAddress);
    });

    it("ignores an ids lookup result that belongs to another address", async () => {
      isCorporateMember.value = true;
      checkPermissionsMock.mockReturnValue(true);
      user.value.contact!.selectedAddressId = "orgAddrOnAnotherPage";
      selectedOrganizationAddressResult.value = { currentOrganizationAddresses: { items: [{ id: "staleAddr" }] } };

      const { selectedAddress } = useShipToLocation();
      await nextTick();

      expect(selectedAddress.value).toBeUndefined();
    });

    it("falls back to the cart's delivery address when the ids lookup hasn't resolved yet", async () => {
      // Same "not on the current page" scenario, but the dedicated lookup query hasn't returned
      // a result yet - the cart's already-loaded delivery address is used as a last resort.
      isAuthenticated.value = true;
      isCorporateMember.value = false;
      user.value.contact!.selectedAddressId = "addrOnAnotherPage";

      const deliveryAddress: AnyAddressType = {
        id: "addrOnAnotherPage",
        line1: "Address From Another Page",
        line2: "",
        city: "City",
        regionName: "Region",
        countryName: "Country",
        postalCode: "0000",
      };
      shipment.value = { id: "shipment1", deliveryAddress };

      const { selectedAddress } = useShipToLocation();
      await nextTick();

      expect(selectedAddress.value).toEqual(deliveryAddress);
    });

    it("computes selectedAddress correctly for corporate user", async () => {
      isAuthenticated.value = true;
      isCorporateMember.value = true;
      checkPermissionsMock.mockReturnValue(true);
      user.value.contact!.selectedAddressId = "orgAddr1";

      const { selectedAddress } = useShipToLocation();
      await nextTick();

      expect(selectedAddress.value).toEqual(organizationAddresses.value[0]);
    });

    it("computes selectedAddress correctly for corporate-limited user with organization address", async () => {
      isAuthenticated.value = true;
      isCorporateMember.value = true;
      checkPermissionsMock.mockReturnValue(false);
      user.value.contact!.selectedAddressId = "orgAddr1";

      const { selectedAddress } = useShipToLocation();
      await nextTick();

      expect(selectedAddress.value).toEqual(organizationAddresses.value[0]);
    });

    it("computes selectedAddress correctly for corporate-limited user with local address", async () => {
      isAuthenticated.value = true;
      isCorporateMember.value = true;
      checkPermissionsMock.mockReturnValue(false);
      user.value.contact!.selectedAddressId = "nonExistentOrgAddress";

      const localAddress: AnyAddressType = {
        id: "localCorpLimited",
        line1: "Local Corp Limited Address",
        line2: "",
        city: "City",
        regionName: "Region",
        countryName: "Country",
        postalCode: "0000",
      };

      setLocalStorageValue("local_ship_to_addresses_localCorpLimited", [localAddress]);
      setLocalStorageValue("selected_local_ship_to_address_id_localCorpLimited", "localCorpLimited");

      const { selectedAddress } = useShipToLocation();
      await nextTick();

      expect(selectedAddress.value).toBe(undefined);
    });

    it("computes selectedAddress correctly for anonymous user", async () => {
      isAuthenticated.value = false;
      const localAddress: AnyAddressType = {
        id: "localAddr1",
        line1: "Local Address",
        line2: "",
        city: "City",
        regionName: "Region",
        countryName: "Country",
        postalCode: "0000",
      };

      setLocalStorageValue("local_ship_to_addresses_anonymous", [localAddress]);
      setLocalStorageValue("local_ship_to_selected_address_id_anonymous", "localAddr1");

      const { selectedAddress } = useShipToLocation();

      await nextTick();

      expect(selectedAddress.value).toEqual(localAddress);
    });

    it("returns undefined for selectedAddress when selectedLocalShipToAddressId does not match any address (anonymous)", async () => {
      isAuthenticated.value = false;
      setLocalStorageValue("local_ship_to_addresses_localAddr1", [
        {
          id: "localAddr1",
          line1: "Local Address",
          line2: "",
          city: "City",
          regionName: "Region",
          countryName: "Country",
          postalCode: "0000",
        },
      ]);
      setLocalStorageValue("selected_local_ship_to_address_id_localAddr1", "nonMatchingId");
      const { selectedAddress } = useShipToLocation();
      await nextTick();
      expect(selectedAddress.value).toBeUndefined();
    });

    it("does not update local selected address when selectAddress is called for an authenticated (personal) user, but calls updateShipment", async () => {
      // For authenticated user
      isAuthenticated.value = true;
      setLocalStorageValue("selected_local_ship_to_address_id_personal1", null); // should remain null for authenticated
      const dummyAddress = {
        id: "personal1",
        line1: "Personal Address",
        line2: "",
        city: "City",
        regionName: "Region",
        countryName: "Country",
        postalCode: "0000",
      };
      const { selectAddress } = useShipToLocation();
      await selectAddress(dummyAddress);
      expect(getLocalStorageValue("selected_local_ship_to_address_id_personal1")).toBeNull();
      expect(updateShipmentMock).toHaveBeenCalledWith({
        id: shipment.value.id,
        deliveryAddress: dummyAddress,
      });
    });

    it("handles selection of non-existent address gracefully", async () => {
      // Try to select an address not in the current personal addresses list
      const nonExistentAddress = {
        id: "nonExistentId",
        line1: "Nonexistent Address",
        line2: "",
        city: "Nowhere",
        regionName: "NA",
        countryName: "Unknown",
        postalCode: "0000",
      };

      const { selectAddress } = useShipToLocation();
      await selectAddress(nonExistentAddress);

      // Should still update shipment even if address is not in the list
      expect(updateShipmentMock).toHaveBeenCalledWith({
        id: shipment.value.id,
        deliveryAddress: nonExistentAddress,
      });
    });

    it("computes selectedAddress as undefined when user has no contact", async () => {
      isAuthenticated.value = true;
      isCorporateMember.value = false;
      user.value = { contact: undefined };

      const { selectedAddress } = useShipToLocation();
      await nextTick();

      expect(selectedAddress.value).toBeUndefined();
    });

    it("does not call updateContact when user.contact is undefined", async () => {
      isAuthenticated.value = true;
      // Set user.contact to undefined
      user.value = { contact: undefined };

      const dummyAddress: AnyAddressType = {
        id: "personal1",
        line1: "Personal Address",
        line2: "",
        city: "City",
        regionName: "Region",
        countryName: "Country",
        postalCode: "0000",
      };

      const { selectAddress } = useShipToLocation();
      await selectAddress(dummyAddress);

      // Should not call updateContact
      expect(updateContactMock).not.toHaveBeenCalled();

      // Should still update shipment
      expect(updateShipmentMock).toHaveBeenCalledWith({
        id: shipment.value.id,
        deliveryAddress: dummyAddress,
      });
    });
  });

  describe("Modal Handling", () => {
    it("opens add or update address modal and handles onResult for personal user", async () => {
      // Personal user: isCorporateMember remains false
      const { openAddOrUpdateAddressModal } = useShipToLocation();
      openAddOrUpdateAddressModal();
      expect(openModalMock).toHaveBeenCalled();
      const modalOptions = openModalMock.mock.calls[0][0] as IModalOptions;
      // For personal user, the modal component should be the one from add-or-update-address-modal.vue
      expect(modalOptions.component.name).toBe("AddOrUpdateAddressModal");
      const dummyAddress: AnyAddressType = {
        id: "temp",
        line1: "New Address",
        line2: "",
        city: "City",
        regionName: "Region",
        countryName: "Country",
        postalCode: "0000",
      };
      await modalOptions.props.onResult(dummyAddress);
      expect(addOrUpdatePersonalAddressesMock).toHaveBeenCalledWith([dummyAddress]);
      expect(closeModalMock).toHaveBeenCalled();
      expect(updateShipmentMock).toHaveBeenCalledWith({
        id: shipment.value.id,
        deliveryAddress: dummyAddress,
      });
    });

    it("opens add or update address modal and handles onResult for corporate user (with permission)", async () => {
      // For corporate user with permission
      isCorporateMember.value = true; // user type becomes CORPORATE
      checkPermissionsMock.mockReturnValue(true);
      const { openAddOrUpdateAddressModal } = useShipToLocation();
      openAddOrUpdateAddressModal();
      expect(openModalMock).toHaveBeenCalled();
      const modalOptions = openModalMock.mock.calls[0][0] as IModalOptions;
      expect(modalOptions.component.name).toBe("AddOrUpdateCompanyAddressModal");
      const dummyAddress: AnyAddressType = {
        id: "corpAddr",
        line1: "Corp Address",
        line2: "",
        city: "City",
        regionName: "Region",
        countryName: "Country",
        postalCode: "0000",
      };
      await modalOptions.props.onResult(dummyAddress);
      expect(addOrUpdateOrganizationAddressesMock).toHaveBeenCalledWith([dummyAddress]);
      expect(closeModalMock).toHaveBeenCalled();
      expect(updateShipmentMock).toHaveBeenCalledWith({
        id: shipment.value.id,
        deliveryAddress: dummyAddress,
      });
    });

    it("opens add or update address modal and handles onResult for anonymous (or corporate limited)", async () => {
      // For anonymous user
      isAuthenticated.value = false;
      const { openAddOrUpdateAddressModal } = useShipToLocation();
      openAddOrUpdateAddressModal();
      expect(openModalMock).toHaveBeenCalled();
      const modalOptions = openModalMock.mock.calls[0][0] as IModalOptions;
      const dummyAddress: AnyAddressType = {
        id: "shouldBeReplaced",
        line1: "Anon Address",
        line2: "",
        city: "City",
        regionName: "Region",
        countryName: "Country",
        postalCode: "0000",
      };
      await modalOptions.props.onResult(dummyAddress);
      expect(getLocalStorageValue("local_ship_to_addresses_anonymous")?.length).toBe(1);
      expect(closeModalMock).toHaveBeenCalled();
      expect(updateShipmentMock).toHaveBeenCalledWith({
        id: shipment.value.id,
        deliveryAddress: dummyAddress,
      });
    });
  });

  describe("Adding a new address", () => {
    const newAddress: AnyAddressType = {
      line1: "New Address",
      line2: "",
      city: "City",
      regionName: "Region",
      countryName: "Country",
      postalCode: "0000",
    };

    it.each([
      { userType: "personal", isCorporate: false, mutationMock: addOrUpdatePersonalAddressesMock },
      { userType: "corporate", isCorporate: true, mutationMock: addOrUpdateOrganizationAddressesMock },
    ])("selects the address by the id the server returned ($userType)", async ({ isCorporate, mutationMock }) => {
      isCorporateMember.value = isCorporate;
      checkPermissionsMock.mockReturnValue(true);
      mutationMock.mockResolvedValueOnce([
        { ...newAddress, id: "otherId", line1: "Other Address" },
        {
          ...newAddress,
          id: "serverId",
          addressType: 3,
          regionName: "Region Name From Server",
          line2: null,
          isDefault: false,
          isFavorite: false,
          __typename: "MemberAddressType",
          // The generated type has no null, but the server sends null for empty fields
        },
      ]);

      const { openAddOrUpdateAddressModal } = useShipToLocation();
      openAddOrUpdateAddressModal();
      const modalOptions = openModalMock.mock.calls[0][0] as IModalOptions;
      await modalOptions.props.onResult({ ...newAddress });

      expect(updateContactMock).toHaveBeenCalledWith(expect.objectContaining({ selectedAddressId: "serverId" }));
      expect(updateShipmentMock).toHaveBeenCalledWith({
        id: shipment.value.id,
        deliveryAddress: expect.objectContaining({ id: "serverId" }) as AnyAddressType,
      });
    });

    it("leaves the id empty when the server response has no matching address", async () => {
      addOrUpdatePersonalAddressesMock.mockResolvedValueOnce([{ ...newAddress, id: "otherId", line1: "Other" }]);

      const { openAddOrUpdateAddressModal } = useShipToLocation();
      openAddOrUpdateAddressModal();
      const modalOptions = openModalMock.mock.calls[0][0] as IModalOptions;
      await modalOptions.props.onResult({ ...newAddress });

      expect(updateShipmentMock).toHaveBeenCalledWith({
        id: shipment.value.id,
        deliveryAddress: expect.objectContaining({ id: undefined }) as AnyAddressType,
      });
    });
  });

  describe("Loading State", () => {
    it("computes loading value based on user and addresses loading states", async () => {
      const { loading } = useShipToLocation();
      expect(loading.value).toBe(false);
      loadingUser.value = true;
      await nextTick();
      expect(loading.value).toBe(true);
      loadingUser.value = false;
      personalAddressesLoading.value = true;
      await nextTick();
      expect(loading.value).toBe(true);
      personalAddressesLoading.value = false;
      await nextTick();
      expect(loading.value).toBe(false);
    });

    it("ignores the loading state of the other user type's address list", () => {
      const { loading } = useShipToLocation();
      organizationAddressesLoading.value = true;
      expect(loading.value).toBe(false);
    });
  });

  describe("Use correct addresses for different user types", () => {
    it("for corporate user with permission, use organization addresses", () => {
      isCorporateMember.value = true;
      checkPermissionsMock.mockReturnValue(true);
      const { accountAddresses } = useShipToLocation();
      expect(accountAddresses.value).toEqual(organizationAddresses.value);
    });

    it("for corporate limited user type, and saved organization address, use organization addresses", () => {
      isCorporateMember.value = true;
      checkPermissionsMock.mockReturnValue(false);
      const localAddress = {
        id: "localCorpLimited",
        line1: "Local Corp Limited Address",
        line2: "",
        city: "City",
        regionName: "Region",
        countryName: "Country",
        postalCode: "0000",
      };
      setLocalStorageValue("local_ship_to_addresses_localCorpLimited", [localAddress]);

      const { accountAddresses } = useShipToLocation();
      expect(accountAddresses.value).toEqual(organizationAddresses.value);
    });

    it("for corporate user without permission, and no saved organization address, use local addresses", () => {
      isCorporateMember.value = true;
      checkPermissionsMock.mockReturnValue(false);
      organizationAddresses.value = [];
      organizationTotalCount.value = 0;

      const localAddress = {
        id: "localAddr1",
        line1: "Local Address",
        line2: "",
        city: "City",
        regionName: "Region",
        countryName: "Country",
        postalCode: "0000",
      };
      setLocalStorageValue("local_ship_to_addresses_user1", [localAddress]);

      const { accountAddresses } = useShipToLocation();
      expect(accountAddresses.value).toEqual(getLocalStorageValue("local_ship_to_addresses_user1"));
    });

    it("for anonymous user, use local addresses", () => {
      isAuthenticated.value = false;
      const localAddress = {
        id: "localAddr1",
        line1: "Local Address",
        line2: "",
        city: "City",
        regionName: "Region",
        countryName: "Country",
        postalCode: "0000",
      };
      setLocalStorageValue("local_ship_to_addresses_anonymous", [localAddress]);

      const { accountAddresses } = useShipToLocation();
      expect(accountAddresses.value).toEqual(getLocalStorageValue("local_ship_to_addresses_anonymous"));
    });
  });

  describe("Address Management", () => {
    it("updates shipment with new address when address is selected", async () => {
      const newAddress: AnyAddressType = {
        id: "newAddr1",
        line1: "New Address",
        line2: "",
        city: "NewCity",
        regionName: "NewRegion",
        countryName: "NewCountry",
        postalCode: "9999",
      };

      const { selectAddress } = useShipToLocation();
      await selectAddress(newAddress);

      expect(updateShipmentMock).toHaveBeenCalledWith({
        id: shipment.value.id,
        deliveryAddress: newAddress,
      });
    });

    it("handles address selection for different user types appropriately", async () => {
      // Test for authenticated user
      isAuthenticated.value = true;
      const personalAddress: AnyAddressType = {
        id: "personal1",
        line1: "Personal Address",
        line2: "",
        city: "City",
        regionName: "Region",
        countryName: "Country",
        postalCode: "0000",
      };

      const { selectAddress } = useShipToLocation();
      await selectAddress(personalAddress);

      // Should update shipment but not local storage
      expect(updateShipmentMock).toHaveBeenCalledWith({
        id: shipment.value.id,
        deliveryAddress: personalAddress,
      });
      expect(getLocalStorageValue("local_ship_to_selected_address_id_user1")).toBeNull();

      // Reset and test for anonymous user
      updateShipmentMock.mockClear();
      isAuthenticated.value = false;
      const { selectAddress: anonymousSelectAddress } = useShipToLocation();

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const anonymousAddress: AnyAddressType = {
        id: "anon1",
        line1: "Anonymous Address",
        line2: "",
        city: "City",
        regionName: "Region",
        countryName: "Country",
        postalCode: "0000",
      };

      await anonymousSelectAddress(anonymousAddress);
      // Should update both shipment and local storage
      expect(updateShipmentMock).toHaveBeenCalledWith({
        id: shipment.value.id,
        deliveryAddress: anonymousAddress,
      });
      expect(getLocalStorageValue("local_ship_to_selected_address_id_anonymous")).toBe("anon1");
    });
  });

  describe("Local Storage Integration", () => {
    it("stores selected address ID in local storage for anonymous users", async () => {
      isAuthenticated.value = false;
      const anonymousAddress: AnyAddressType = {
        id: "anon1",
        line1: "Anonymous Address",
        line2: "",
        city: "City",
        regionName: "Region",
        countryName: "Country",
        postalCode: "0000",
      };

      // First, ensure the address exists in local storage
      setLocalStorageValue("local_ship_to_addresses_anonymous", [anonymousAddress]);

      // Then select it
      const { selectAddress } = useShipToLocation();
      await selectAddress(anonymousAddress);

      // Verify it's stored in local storage
      expect(getLocalStorageValue("local_ship_to_selected_address_id_anonymous")).toBe("anon1");
    });

    it("uses addresses from local storage for anonymous users", () => {
      isAuthenticated.value = false;
      const localAddresses = [
        {
          id: "local1",
          line1: "Local Address 1",
          line2: "",
          city: "City",
          regionName: "Region",
          countryName: "Country",
          postalCode: "0000",
        },
        {
          id: "local2",
          line1: "Local Address 2",
          line2: "",
          city: "City",
          regionName: "Region",
          countryName: "Country",
          postalCode: "0000",
        },
      ];

      setLocalStorageValue("local_ship_to_addresses_anonymous", localAddresses as [AnyAddressType]);

      const { accountAddresses } = useShipToLocation();

      // For anonymous users, accountAddresses should return the local addresses
      expect(accountAddresses.value).toEqual(localAddresses);
    });
  });
  describe("Search", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("applies the search to the server keyword after the debounce and resets the page", async () => {
      personalPage.value = 3;
      const { search, isSearchPending } = useShipToLocation();

      search.value = "main";
      await nextTick();

      expect(isSearchPending.value).toBe(true);
      expect(personalKeyword.value).toBe("");

      await vi.advanceTimersByTimeAsync(300);

      expect(personalKeyword.value).toBe("main");
      expect(personalPage.value).toBe(1);
      expect(isSearchPending.value).toBe(false);
    });

    it("treats a cleared (undefined) search box as an empty keyword", async () => {
      personalKeyword.value = "main";
      const { search, isSearchPending } = useShipToLocation();

      search.value = undefined;
      await vi.advanceTimersByTimeAsync(300);

      expect(personalKeyword.value).toBe("");
      expect(isSearchPending.value).toBe(false);
    });

    it("keeps the address count independent of a search with no results", async () => {
      personalTotalCount.value = 10;
      const { addressesCount } = useShipToLocation();

      personalKeyword.value = "zzz";
      personalAddresses.value = [];
      personalTotalCount.value = 0;
      await nextTick();

      expect(addressesCount.value).toBe(10);
    });

    it("applies the search and pagination to the organization address book for a corporate user", async () => {
      isCorporateMember.value = true;
      checkPermissionsMock.mockReturnValue(true);
      organizationPage.value = 3;
      organizationPages.value = 4;

      const { search, page, pages } = useShipToLocation();

      expect(page.value).toBe(3);
      expect(pages.value).toBe(4);

      search.value = "main";
      await vi.advanceTimersByTimeAsync(300);

      expect(organizationKeyword.value).toBe("main");
      expect(organizationPage.value).toBe(1);
      expect(personalKeyword.value).toBe("");

      page.value = 2;

      expect(organizationPage.value).toBe(2);
      expect(personalPage.value).toBe(1);
    });

    it("does not take the address count from a list that is still loading", async () => {
      personalTotalCount.value = 10;
      const { addressesCount } = useShipToLocation();

      personalAddressesLoading.value = true;
      personalTotalCount.value = 0;
      await nextTick();

      expect(addressesCount.value).toBe(10);

      personalTotalCount.value = 12;
      personalAddressesLoading.value = false;
      await nextTick();

      expect(addressesCount.value).toBe(12);
    });

    it("keeps a corporate-limited user on organization addresses after a search with no results", async () => {
      isCorporateMember.value = true;
      checkPermissionsMock.mockReturnValue(false);
      organizationTotalCount.value = 10;
      user.value.contact!.selectedAddressId = "orgAddr1";
      setLocalStorageValue("local_ship_to_addresses_user1", [{ id: "local-1", line1: "Local" }]);

      const { accountAddresses, canAddNewAddress, isPaginated, selectedAddress } = useShipToLocation();
      expect(selectedAddress.value).toEqual(organizationAddresses.value[0]);

      organizationKeyword.value = "zzz";
      organizationAddresses.value = [];
      organizationTotalCount.value = 0;
      await nextTick();

      expect(isPaginated.value).toBe(true);
      expect(accountAddresses.value).toEqual([]);
      expect(canAddNewAddress.value).toBe(false);
      expect(organizationSelectedAddressQueryEnabled?.value).toBe(true);
    });

    it("lets a corporate-limited user add local addresses only when the organization has none", () => {
      isCorporateMember.value = true;
      checkPermissionsMock.mockReturnValue(false);
      organizationAddresses.value = [];
      organizationTotalCount.value = 0;

      const { canAddNewAddress, isPaginated } = useShipToLocation();

      expect(isPaginated.value).toBe(false);
      expect(canAddNewAddress.value).toBe(true);
    });
  });

  describe("Local storage keys", () => {
    it("follows the current user after sign-in", async () => {
      isAuthenticated.value = false;
      setLocalStorageValue("local_ship_to_addresses_anonymous", [{ id: "anon1" }]);

      const { accountAddresses } = useShipToLocation();
      expect(accountAddresses.value).toEqual([{ id: "anon1" }]);

      isAuthenticated.value = true;
      isCorporateMember.value = true;
      checkPermissionsMock.mockReturnValue(false);
      organizationAddresses.value = [];
      organizationTotalCount.value = 0;
      await nextTick();

      expect(accountAddresses.value).toEqual([]);
    });
  });
});
