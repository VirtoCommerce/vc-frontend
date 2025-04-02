import { describe, it, expect, beforeEach, vi } from "vitest";
import { ref } from "vue";

interface IAddress {
  id: string;
  [key: string]: unknown;
}

interface IShippingMethod {
  code: string;
  name: string;
  [key: string]: unknown;
}

interface IShipment {
  id: string;
  deliveryAddress?: IAddress;
  [key: string]: unknown;
}

interface IPickupInStoreResult {
  pickupLocations?: {
    items: IPickupLocation[];
  };
}

interface IPickupLocation {
  name: string;
  address: IAddress;
  [key: string]: unknown;
}

// Define more complete interfaces for mocking
interface IModalOptions {
  component: unknown;
  props: Record<string, unknown>;
  [key: string]: unknown;
}

// Mock the necessary types for Apollo
interface IApolloLazyQueryReturn {
  result: Ref<IPickupInStoreResult | undefined>;
  loading: Ref<boolean>;
  error: Ref<Error | null>;
  load: ReturnType<typeof vi.fn>;
  // Add additional required properties with defaults
  networkStatus: Ref<number>;
  start: () => void;
  stop: () => void;
  restart: () => void;
  [key: string]: unknown;
}

// Mock external dependencies
vi.mock("@/core/api/graphql/shipment", () => ({
  getPickupLocations: vi.fn(),
}));

vi.mock("@/shared/cart/composables", () => ({
  useFullCart: vi.fn(),
}));

vi.mock("@/shared/modal", () => ({
  useModal: vi.fn(),
}));

vi.mock("@/core/globals", () => ({
  globals: {
    storeId: "test-store-id",
  },
}));

// Import the mocked functions for later configuration
import { getPickupLocations } from "@/core/api/graphql/shipment";
import { useFullCart } from "@/shared/cart/composables";
import { useModal } from "@/shared/modal";
import { useBopis, BOPIS_CODE } from "./useBopis";
import type { Ref, ComputedRef } from "vue";
import SelectAddressModal from "@/shared/checkout/components/select-address-modal.vue";

describe("useBopis composable", () => {
  // Define variables with appropriate types
  let resultRef: Ref<IPickupInStoreResult | undefined>;
  let loadingRef: Ref<boolean>;
  let errorRef: Ref<Error | null>;
  let loadMock: ReturnType<typeof vi.fn>;
  let availableShippingMethods: Ref<IShippingMethod[]>;
  let shipment: Ref<IShipment | null>;
  let updateShipment: ReturnType<typeof vi.fn>;
  let openModal: ReturnType<typeof vi.fn>;
  let closeModal: ReturnType<typeof vi.fn>;
  let mockUseLazyQueryReturn: IApolloLazyQueryReturn;

  beforeEach(() => {
    // Initialize reactive refs
    resultRef = ref(undefined);
    loadingRef = ref(false);
    errorRef = ref(null);
    loadMock = vi.fn();

    // Create a more complete mock for the Apollo query
    mockUseLazyQueryReturn = {
      result: resultRef,
      loading: loadingRef,
      error: errorRef,
      load: loadMock,
      networkStatus: ref(7), // 7 typically means ready in Apollo
      start: vi.fn(),
      stop: vi.fn(),
      restart: vi.fn(),
    };

    // Setup getPickupLocations mock
    vi.mocked(getPickupLocations).mockReturnValue(
      mockUseLazyQueryReturn as unknown as ReturnType<typeof getPickupLocations>,
    );

    // Setup useFullCart mock
    availableShippingMethods = ref([]);
    shipment = ref({ id: "shipment1", deliveryAddress: { id: "address1", outerId: "address1-outer" } });
    updateShipment = vi.fn();

    // Create a more complete useFullCart mock
    const fullCartMock = {
      availableShippingMethods: availableShippingMethods as unknown as ComputedRef<IShippingMethod[]>,
      shipment: shipment as unknown as ComputedRef<IShipment | null>,
      updateShipment,
      // Add required properties
      cart: ref(undefined) as unknown as ComputedRef<unknown>,
      payment: ref(undefined) as unknown as ComputedRef<unknown>,
      availablePaymentMethods: ref([]) as unknown as ComputedRef<unknown[]>,
      selectedItemIds: ref([]) as unknown as ComputedRef<string[]>,
      changing: ref(false) as unknown as ComputedRef<boolean>,
    };

    vi.mocked(useFullCart).mockReturnValue(fullCartMock as unknown as ReturnType<typeof useFullCart>);

    // Setup useModal mock
    openModal = vi.fn();
    closeModal = vi.fn();

    const modalMock = {
      openModal,
      closeModal,
      modalStack: ref([]) as unknown as ComputedRef<
        {
          id?: string;
          component: unknown;
          props?: Record<string, unknown>;
        }[]
      >,
    };

    vi.mocked(useModal).mockReturnValue(modalMock as unknown as ReturnType<typeof useModal>);

    // Clear calls before each test run
    vi.clearAllMocks();
  });

  describe("Computed Properties and State Exposure", () => {
    it("should return addresses from getPickupLocations result", () => {
      resultRef.value = {
        pickupLocations: {
          items: [
            { name: "Location 1", address: { id: "address1" } },
            { name: "Location 2", address: { id: "address2" } },
          ],
        },
      };
      const { addresses } = useBopis();
      expect(addresses.value).toEqual([
        { name: "Location 1", address: { id: "address1" } },
        { name: "Location 2", address: { id: "address2" } },
      ]);
    });

    it("should return empty addresses array if result is undefined", () => {
      resultRef.value = undefined;
      const { addresses } = useBopis();
      expect(addresses.value).toEqual([]);
    });

    it("should return empty addresses array if result does not contain addresses", () => {
      resultRef.value = {};
      const { addresses } = useBopis();
      expect(addresses.value).toEqual([]);
    });

    it("should expose loading state", () => {
      loadingRef.value = true;
      const { loading } = useBopis();
      expect(loading.value).toBe(true);
    });

    it("should expose error state", () => {
      const testError = new Error("test error");
      errorRef.value = testError;
      const { error } = useBopis();
      expect(error.value).toBe(testError);
    });

    it("should compute hasBOPIS as true when availableShippingMethods includes BOPIS_CODE", () => {
      availableShippingMethods.value = [
        { code: BOPIS_CODE, name: "BOPIS" },
        { code: "Other", name: "Other" },
      ];
      const { hasBOPIS } = useBopis();
      expect(hasBOPIS.value).toBe(true);
    });

    it("should compute hasBOPIS as false when availableShippingMethods does not include BOPIS_CODE", () => {
      availableShippingMethods.value = [{ code: "Other", name: "Other" }];
      const { hasBOPIS } = useBopis();
      expect(hasBOPIS.value).toBe(false);
    });

    it("should compute bopisMethod correctly when availableShippingMethods includes BOPIS_CODE", () => {
      const bopisObj = { code: BOPIS_CODE, name: "BOPIS" };
      availableShippingMethods.value = [bopisObj, { code: "Other", name: "Other" }];
      const { bopisMethod } = useBopis();
      expect(bopisMethod.value).toEqual(bopisObj);
    });
  });

  describe("fetchAddresses function", () => {
    it("should call load with provided keyword and sort", async () => {
      const { fetchAddresses } = useBopis();
      await fetchAddresses({ keyword: "test", sort: "asc" });
      expect(loadMock).toHaveBeenCalledWith(null, {
        storeId: "test-store-id",
        keyword: "test",
        sort: "asc",
        first: undefined,
        after: undefined,
      });
    });

    it("should call load with undefined parameters when no options provided", async () => {
      const { fetchAddresses } = useBopis();
      await fetchAddresses();
      expect(loadMock).toHaveBeenCalledWith(null, {
        storeId: "test-store-id",
        keyword: undefined,
        sort: undefined,
        first: undefined,
        after: undefined,
      });
    });
  });

  describe("openSelectAddressModal function", () => {
    it("should call fetchAddresses if addresses are empty and then open modal", async () => {
      resultRef.value = { pickupLocations: { items: [] } };
      const { openSelectAddressModal } = useBopis();
      await openSelectAddressModal();
      expect(loadMock).toHaveBeenCalledWith(null, {
        storeId: "test-store-id",
        keyword: undefined,
        sort: undefined,
        first: 999,
        after: undefined,
      });
      expect(openModal).toHaveBeenCalled();

      const modalCalls = openModal.mock.calls as Array<[IModalOptions]>;
      const callArg = modalCalls[0][0];
      expect(callArg.component).toBe(SelectAddressModal);
      expect(callArg.props.addresses).toEqual([]);
      expect(callArg.props.currentAddress).toEqual({
        ...shipment.value?.deliveryAddress,
        id: shipment.value?.deliveryAddress?.outerId,
      });
      expect(callArg.props.isCorporateAddresses).toBe(true);
      expect(callArg.props.allowAddNewAddress).toBe(false);
      expect(typeof callArg.props.onResult).toBe("function");
    });

    it("should open modal directly if addresses exist without calling load", async () => {
      // Set up the result with existing pickup locations
      resultRef.value = {
        pickupLocations: {
          items: [{ name: "Location 1", address: { id: "address1" } }],
        },
      };

      // Reset the loadMock to ensure it's clean before test
      loadMock.mockClear();

      const { openSelectAddressModal } = useBopis();
      await openSelectAddressModal();

      // The implementation only calls fetchAddresses if addresses.value.length is 0
      // Since we've set up the test with an address, loadMock should NOT be called
      expect(loadMock).not.toHaveBeenCalled();

      expect(openModal).toHaveBeenCalled();

      const modalCalls2 = openModal.mock.calls as Array<[IModalOptions]>;
      const callArg2 = modalCalls2[0][0];
      expect(callArg2.component).toBe(SelectAddressModal);

      // Check that normalizedAddresses are passed to the modal
      expect(callArg2.props.addresses).toEqual([{ id: "address1", description: "Location 1" }]);

      expect(callArg2.props.currentAddress).toEqual({
        ...shipment.value?.deliveryAddress,
        id: shipment.value?.deliveryAddress?.outerId,
      });
      expect(callArg2.props.isCorporateAddresses).toBe(true);
      expect(callArg2.props.allowAddNewAddress).toBe(false);
      expect(typeof callArg2.props.onResult).toBe("function");
    });

    it("should update shipment when onResult callback is called", async () => {
      resultRef.value = {
        pickupLocations: {
          items: [{ name: "Location 1", address: { id: "address1" } }],
        },
      };
      const { openSelectAddressModal } = useBopis();
      await openSelectAddressModal();
      expect(openModal).toHaveBeenCalled();

      const modalCalls3 = openModal.mock.calls as Array<[IModalOptions]>;
      const modalOptions = modalCalls3[0][0];
      const onResult = modalOptions.props.onResult as (address: IAddress) => Promise<void>;
      expect(typeof onResult).toBe("function");

      const newAddress: IAddress = { id: "address2" };
      await onResult(newAddress);
      expect(updateShipment).toHaveBeenCalledWith({
        id: shipment.value?.id,
        deliveryAddress: {
          ...newAddress,
          outerId: newAddress.id,
        },
      });
    });

    it("should handle missing shipment gracefully, passing undefined currentAddress", async () => {
      shipment.value = null;
      resultRef.value = {
        pickupLocations: {
          items: [{ name: "Location 1", address: { id: "address1" } }],
        },
      };
      const { openSelectAddressModal } = useBopis();
      await openSelectAddressModal();
      expect(openModal).toHaveBeenCalled();

      const modalCalls4 = openModal.mock.calls as Array<[IModalOptions]>;
      const modalOptions2 = modalCalls4[0][0];

      // In the implementation, currentAddress is now calculated as {...undefined, id: undefined}
      // which resolves to {id: undefined}
      expect(modalOptions2.props.currentAddress).toEqual({ id: undefined });

      const onResult2 = modalOptions2.props.onResult as (address: IAddress) => Promise<void>;
      expect(typeof onResult2).toBe("function");

      const sampleAddress: IAddress = { id: "address3" };
      await onResult2(sampleAddress);
      expect(updateShipment).toHaveBeenCalledWith({
        id: undefined,
        deliveryAddress: {
          ...sampleAddress,
          outerId: sampleAddress.id,
        },
      });
    });
  });
});
