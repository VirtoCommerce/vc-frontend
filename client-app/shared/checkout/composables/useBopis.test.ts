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

// Define more complete interfaces for mocking
interface IModalOptions {
  component: unknown;
  props: Record<string, unknown>;
  [key: string]: unknown;
}

// Mock external dependencies
vi.mock("@/shared/cart/composables", () => ({
  useFullCart: vi.fn(),
  useCartPickupLocations: vi.fn(),
}));

vi.mock("@/shared/modal", () => ({
  useModal: vi.fn(),
}));

vi.mock("@/core/globals", () => ({
  globals: {
    storeId: "test-store-id",
  },
}));

vi.mock("@/core/composables/useModuleSettings", () => ({
  useModuleSettings: vi.fn(),
}));

// Import the mocked functions for later configuration
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { useCartPickupLocations, useFullCart } from "@/shared/cart/composables";
import { useModal } from "@/shared/modal";
import { useBopis, BOPIS_CODE } from "./useBopis";
import type { ProductPickupLocation } from "@/core/api/graphql/types";
import type { Ref, ComputedRef } from "vue";

describe("useBopis composable", () => {
  // Define variables with appropriate types
  let resultRef: Ref<ProductPickupLocation[]>;
  let loadingRef: Ref<boolean>;
  let availableShippingMethods: Ref<IShippingMethod[]>;
  let shipment: Ref<IShipment | null>;
  let updateShipment: ReturnType<typeof vi.fn>;
  let openModal: ReturnType<typeof vi.fn>;
  let closeModal: ReturnType<typeof vi.fn>;
  let isEnabled: ReturnType<typeof vi.fn>;
  let getSettingValue: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Initialize reactive refs
    resultRef = ref([]);
    loadingRef = ref(false);

    // Setup useModuleSettings mock
    isEnabled = vi.fn().mockReturnValue(false);
    getSettingValue = vi.fn().mockReturnValue(undefined);

    vi.mocked(useModuleSettings).mockReturnValue({
      isEnabled,
      getSettingValue,
      hasModuleSettings: ref(false) as unknown as ComputedRef<boolean>,
      moduleSettings: ref([]) as unknown as ComputedRef<
        { name: string; value?: string | number | boolean | null }[] | undefined
      >,
      getModuleSettings: vi.fn().mockReturnValue({}),
    });

    vi.mocked(useCartPickupLocations).mockReturnValue({
      fetchPickupLocations: vi.fn(),
      pickupLocations: resultRef,
      pickupLocationsLoading: loadingRef,
    });

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
    it("should return addresses from fetchPickupLocations result", () => {
      resultRef.value = [
        { id: "ID1", name: "Location 1", address: { id: "address1" }, isActive: true },
        { id: "ID1", name: "Location 2", address: { id: "address2" }, isActive: true },
      ];

      const { addresses } = useBopis();
      expect(addresses.value).toEqual([
        { id: "ID1", name: "Location 1", address: { id: "address1" }, isActive: true },
        { id: "ID1", name: "Location 2", address: { id: "address2" }, isActive: true },
      ]);
    });

    it("should return empty addresses array if result is undefined", () => {
      resultRef.value = [];
      const { addresses } = useBopis();
      expect(addresses.value).toEqual([]);
    });

    it("should expose loading state", () => {
      loadingRef.value = true;
      const { loading } = useBopis();
      expect(loading.value).toBe(true);
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

  describe("openSelectAddressModal function", () => {
    it("should update shipment when onResult callback is called", async () => {
      resultRef.value = [{ id: "ID1", name: "Location 1", address: { id: "address1" }, isActive: true }];
      const { openSelectAddressModal } = useBopis();
      await openSelectAddressModal("cartId123");
      expect(openModal).toHaveBeenCalled();

      const modalCalls3 = openModal.mock.calls as Array<[IModalOptions]>;
      const modalOptions = modalCalls3[0][0];
      const onResult = modalOptions.props.onResult as (address: IAddress) => Promise<void>;
      expect(typeof onResult).toBe("function");

      const newAddress: IAddress = { id: "address2" };
      await onResult(newAddress);
      expect(updateShipment).toHaveBeenCalledWith({
        id: shipment.value?.id,
        pickupLocationId: "address2",
      });
    });

    it("should handle missing shipment gracefully, passing undefined currentAddress", async () => {
      shipment.value = null;
      resultRef.value = [{ id: "ID1", name: "Location 1", address: { id: "address1" }, isActive: true }];
      const { openSelectAddressModal } = useBopis();
      await openSelectAddressModal("cartId123");
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
        pickupLocationId: "address3",
      });
    });
  });
});
