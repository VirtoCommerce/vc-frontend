import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick, ref } from "vue";
import { useBopis, MAX_ADDRESSES_NUMBER } from "./useBopis";
import type { AnyAddressType } from "@/core/types";

// Use vi.hoisted() to properly hoist mock functions
const openModalMock = vi.hoisted(() => vi.fn());
const closeModalMock = vi.hoisted(() => vi.fn());
const checkPermissionsMock = vi.hoisted(() => vi.fn());
const fetchPersonalAddressesMock = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const addOrUpdatePersonalAddressesMock = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const addOrUpdateOrganizationAddressesMock = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const updateShipmentMock = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

// Module mocks
vi.mock("@/shared/modal", () => ({
  useModal: () => ({
    openModal: openModalMock,
    closeModal: closeModalMock,
  }),
}));

vi.mock("@/shared/account", () => ({
  useUser: () => ({
    isAuthenticated,
    isCorporateMember,
    loading: loadingUser,
    organization,
    checkPermissions: checkPermissionsMock,
  }),
  useUserAddresses: () => ({
    addresses: personalAddresses,
    fetchAddresses: fetchPersonalAddressesMock,
    addOrUpdateAddresses: addOrUpdatePersonalAddressesMock,
    loading: userAddressesLoading,
  }),
}));

vi.mock("@/shared/company", () => ({
  useOrganizationAddresses: () => ({
    addresses: organizationAddresses,
    fetchAddresses: vi.fn().mockResolvedValue(undefined),
    addOrUpdateAddresses: addOrUpdateOrganizationAddressesMock,
    loading: orgLoading,
  }),
  AddOrUpdateCompanyAddressModal: { name: "AddOrUpdateCompanyAddressModal" },
}));

vi.mock("@/shared/cart", () => ({
  useFullCart: () => ({
    updateShipment: updateShipmentMock,
    shipment,
    forceFetch: vi.fn(),
  }),
}));

vi.mock("@vueuse/core", async () => {
  const actual = await vi.importActual("@vueuse/core");
  return {
    ...actual,
    useLocalStorage: <T>(key: string, initialValue: T) => {
      if (key === "localShipToAddresses") {
        return localShipToAddressesValue;
      }
      if (key === "selectedLocalShipToAddressId") {
        return selectedLocalShipToAddressIdValue;
      }
      return ref(initialValue);
    },
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
    addresses?: unknown;
    currentAddress?: unknown;
    isCorporateAddresses?: boolean;
    onResult: (address: AnyAddressType) => Promise<void> | void;
    onAddNewAddress: () => void;
  };
}

// Reactive mocks
const isAuthenticated = ref(true);
const isCorporateMember = ref(false);
const loadingUser = ref(false);
const organization = ref({ id: "org1" });

const personalAddresses = ref<AnyAddressType[]>([]);

const organizationAddresses = ref<AnyAddressType[]>([]);

const orgLoading = ref(false);
const userAddressesLoading = ref(false);

// Mocks for vueuse local storage
const localShipToAddressesValue = ref<AnyAddressType[]>([]);
const selectedLocalShipToAddressIdValue = ref<string | null>(null);

// Cart mocks
const shipment = ref({ id: "shipment1", deliveryAddress: { id: "addr1" } });

describe("useBopis composable", () => {
  beforeEach(() => {
    // Reset mocks and reactive state
    openModalMock.mockClear();
    closeModalMock.mockClear();
    checkPermissionsMock.mockClear();
    fetchPersonalAddressesMock.mockClear();
    addOrUpdatePersonalAddressesMock.mockClear();
    addOrUpdateOrganizationAddressesMock.mockClear();
    updateShipmentMock.mockClear();

    isAuthenticated.value = true;
    isCorporateMember.value = false;
    loadingUser.value = false;
    organization.value = { id: "org1" };

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

    userAddressesLoading.value = false;
    orgLoading.value = false;
    localShipToAddressesValue.value = [];
    selectedLocalShipToAddressIdValue.value = null;
    shipment.value = { id: "shipment1", deliveryAddress: { id: "addr1" } };
    checkPermissionsMock.mockReturnValue(false);
  });

  describe("User Type & Address Fetching", () => {
    it("computes user type as personal when authenticated and not corporate", () => {
      const { accountAddresses } = useBopis();
      expect(accountAddresses.value).toEqual(personalAddresses.value);
    });

    it("calls fetchPersonalAddresses when user is personal", async () => {
      const { fetchAddresses } = useBopis();
      await fetchAddresses();
      expect(fetchPersonalAddressesMock).toHaveBeenCalled();
    });
  });

  describe("Address Filtering", () => {
    it("returns sliced addresses when no filter is provided and isSeeMore is false", () => {
      // Fill personalAddresses with more than MAX_ADDRESSES_NUMBER addresses
      const addressesArray: AnyAddressType[] = Array.from({ length: 10 }, (_, i) => ({
        id: `addr${i}`,
        line1: `Address ${i}`,
        line2: "",
        city: "City",
        regionName: "Region",
        countryName: "Country",
        postalCode: "0000",
      }));
      personalAddresses.value = addressesArray;
      const { getFilteredAddresses } = useBopis();
      const result = getFilteredAddresses(false);
      expect(result.length).toBe(MAX_ADDRESSES_NUMBER);
      expect(result).toEqual(addressesArray.slice(0, MAX_ADDRESSES_NUMBER));
    });

    it("filters addresses correctly when a filter is provided", () => {
      personalAddresses.value = [
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
      ];
      const { getFilteredAddresses } = useBopis();
      const result = getFilteredAddresses(true, "New York");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("addr1");
    });

    it("returns an empty array when no address matches the filter", () => {
      personalAddresses.value = [
        {
          id: "addr1",
          line1: "Some Address",
          line2: "",
          city: "City",
          regionName: "Region",
          countryName: "Country",
          postalCode: "0000",
        },
      ];
      const { getFilteredAddresses } = useBopis();
      const result = getFilteredAddresses(false, "NonExistent");
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(0);
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
      const { selectAddress } = useBopis();
      await selectAddress(dummyAddress);
      expect(selectedLocalShipToAddressIdValue.value).toBe("anonAddr1");
      expect(updateShipmentMock).toHaveBeenCalledWith({
        id: shipment.value.id,
        deliveryAddress: dummyAddress,
      });
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
      localShipToAddressesValue.value = [localAddress];
      selectedLocalShipToAddressIdValue.value = "localAddr1";
      const { selectedAddress } = useBopis();
      await nextTick();
      expect(selectedAddress.value).toEqual(localAddress);
    });

    it("returns undefined for selectedAddress when selectedLocalShipToAddressId does not match any address (anonymous)", async () => {
      isAuthenticated.value = false;
      localShipToAddressesValue.value = [
        {
          id: "localAddr1",
          line1: "Local Address",
          line2: "",
          city: "City",
          regionName: "Region",
          countryName: "Country",
          postalCode: "0000",
        },
      ];
      selectedLocalShipToAddressIdValue.value = "nonMatchingId";
      const { selectedAddress } = useBopis();
      await nextTick();
      expect(selectedAddress.value).toBeUndefined();
    });

    it("does not update local selected address when selectAddress is called for an authenticated (personal) user, but calls updateShipment", async () => {
      // For authenticated user
      isAuthenticated.value = true;
      selectedLocalShipToAddressIdValue.value = null; // should remain null for authenticated
      const dummyAddress = {
        id: "personal1",
        line1: "Personal Address",
        line2: "",
        city: "City",
        regionName: "Region",
        countryName: "Country",
        postalCode: "0000",
      };
      const { selectAddress } = useBopis();
      await selectAddress(dummyAddress);
      expect(selectedLocalShipToAddressIdValue.value).toBeNull();
      expect(updateShipmentMock).toHaveBeenCalledWith({
        id: shipment.value.id,
        deliveryAddress: dummyAddress,
      });
    });
  });

  describe("Modal Handling", () => {
    it("opens select address modal with correct props", () => {
      const { openSelectAddressModal } = useBopis();
      openSelectAddressModal();
      expect(openModalMock).toHaveBeenCalled();
      const modalOptions = openModalMock.mock.calls[0][0] as IModalOptions;
      expect(modalOptions.component).toBeDefined();
      expect(modalOptions.props).toHaveProperty("addresses");
      expect(typeof modalOptions.props.onResult).toBe("function");
      expect(typeof modalOptions.props.onAddNewAddress).toBe("function");
    });

    it("opens add or update address modal and handles onResult for personal user", async () => {
      // Personal user: isCorporateMember remains false
      const { openAddOrUpdateAddressModal } = useBopis();
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
      const { openAddOrUpdateAddressModal } = useBopis();
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
      const { openAddOrUpdateAddressModal } = useBopis();
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
      expect(localShipToAddressesValue.value.length).toBe(1);
      expect(closeModalMock).toHaveBeenCalled();
      expect(updateShipmentMock).toHaveBeenCalledWith({
        id: shipment.value.id,
        deliveryAddress: dummyAddress,
      });
    });
  });

  describe("Loading State", () => {
    it("computes loading value based on user and addresses loading states", async () => {
      const { loading } = useBopis();
      expect(loading.value).toBe(false);
      loadingUser.value = true;
      await nextTick();
      expect(loading.value).toBe(true);
      loadingUser.value = false;
      userAddressesLoading.value = true;
      await nextTick();
      expect(loading.value).toBe(true);
      userAddressesLoading.value = false;
      orgLoading.value = true;
      await nextTick();
      expect(loading.value).toBe(true);
    });
  });

  describe("Error Handling", () => {
    it("handles fetchAddresses error gracefully without altering existing personalAddresses", async () => {
      // Set initial personal addresses
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
      // Simulate error in fetchPersonalAddresses
      fetchPersonalAddressesMock.mockRejectedValue(new Error("Test error"));
      const { fetchAddresses } = useBopis();
      try {
        await fetchAddresses();
      } catch (e) {
        // swallow error
      }
      expect(personalAddresses.value).toHaveLength(1);
      expect(personalAddresses.value[0].id).toBe("addr1");
    });
  });

  describe("Use correct addresses for different user types", () => {
    it("for corporate user with permission, use organization addresses", () => {
      isCorporateMember.value = true;
      checkPermissionsMock.mockReturnValue(true);
      const { accountAddresses } = useBopis();
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
      localShipToAddressesValue.value = [localAddress];

      const { accountAddresses } = useBopis();
      expect(accountAddresses.value).toEqual(organizationAddresses.value);
    });

    it("for corporate user without permission, and no saved organization address, use local addresses", () => {
      isCorporateMember.value = true;
      checkPermissionsMock.mockReturnValue(false);
      organizationAddresses.value = [];

      const localAddress = {
        id: "localAddr1",
        line1: "Local Address",
        line2: "",
        city: "City",
        regionName: "Region",
        countryName: "Country",
        postalCode: "0000",
      };
      localShipToAddressesValue.value = [localAddress];

      const { accountAddresses } = useBopis();
      expect(accountAddresses.value).toEqual(localShipToAddressesValue.value);
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
      localShipToAddressesValue.value = [localAddress];

      const { accountAddresses } = useBopis();
      expect(accountAddresses.value).toEqual(localShipToAddressesValue.value);
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

      const { selectAddress } = useBopis();
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

      const { selectAddress } = useBopis();
      await selectAddress(personalAddress);

      // Should update shipment but not local storage
      expect(updateShipmentMock).toHaveBeenCalledWith({
        id: shipment.value.id,
        deliveryAddress: personalAddress,
      });
      expect(selectedLocalShipToAddressIdValue.value).toBeNull();

      // Reset and test for anonymous user
      updateShipmentMock.mockClear();
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

      await selectAddress(anonymousAddress);

      // Should update both shipment and local storage
      expect(updateShipmentMock).toHaveBeenCalledWith({
        id: shipment.value.id,
        deliveryAddress: anonymousAddress,
      });
      expect(selectedLocalShipToAddressIdValue.value).toBe("anon1");
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
      localShipToAddressesValue.value = [anonymousAddress];

      // Then select it
      const { selectAddress } = useBopis();
      await selectAddress(anonymousAddress);

      // Verify it's stored in local storage
      expect(selectedLocalShipToAddressIdValue.value).toBe("anon1");
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

      localShipToAddressesValue.value = localAddresses;

      const { accountAddresses } = useBopis();

      // For anonymous users, accountAddresses should return the local addresses
      expect(accountAddresses.value).toEqual(localAddresses);
    });
  });
});
