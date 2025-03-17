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

  it("computes user type as personal when authenticated and not corporate", () => {
    const { accountAddresses } = useBopis();
    expect(accountAddresses.value).toEqual(personalAddresses.value);
  });

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

  it("calls fetchPersonalAddresses when user is personal", async () => {
    const { fetchAddresses } = useBopis();
    await fetchAddresses();
    expect(fetchPersonalAddressesMock).toHaveBeenCalled();
  });

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
});
