import { beforeEach, describe, expect, it, vi } from "vitest";
import { ValidationErrorObjectType } from "@/core/enums";
import { useCompareAddToCart } from "./useCompareAddToCart";
import type { ICompareDisplayProduct } from "../types";
import type { CartType, Product, ValidationErrorType } from "@/core/api/graphql/types";

const hoisted = vi.hoisted(() => ({
  addToCart: vi.fn(),
  trackAddItemToCart: vi.fn(),
  pushHistoricalEvent: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key, te: () => false }),
}));

vi.mock("@/core/composables", async () => {
  const actual = await vi.importActual<typeof import("@/core/composables")>("@/core/composables");
  return {
    ...actual,
    useHistoricalEvents: () => ({ pushHistoricalEvent: hoisted.pushHistoricalEvent }),
  };
});

vi.mock("@/core/composables/useAnalyticsUtils", () => ({
  useAnalyticsUtils: () => ({ trackAddItemToCart: hoisted.trackAddItemToCart }),
}));

vi.mock("@/shared/cart/composables", () => ({
  useShortCart: () => ({ addToCart: hoisted.addToCart }),
}));

vi.mock("@/shared/notification", () => ({
  useNotifications: () => ({ success: hoisted.success, error: hoisted.error }),
}));

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: "product-1",
    name: "Widget",
    minQuantity: 1,
    availabilityData: {
      isActive: true,
      isAvailable: true,
      isBuyable: true,
      isInStock: true,
      availableQuantity: 100,
    },
    ...overrides,
  } as Product;
}

function item(productOverrides: Partial<Product> = {}, localId?: string): ICompareDisplayProduct {
  const p = product(productOverrides);
  return { product: p, entry: { productId: p.id, categoryKey: "cat", localId } };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

describe("useCompareAddToCart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("isAddToCartDisabled", () => {
    it("is enabled for a fully available product", () => {
      const { isAddToCartDisabled } = useCompareAddToCart();
      expect(isAddToCartDisabled(product())).toBe(false);
    });

    it.each([
      ["isActive", { isActive: false }],
      ["isAvailable", { isAvailable: false }],
      ["isBuyable", { isBuyable: false }],
      ["isInStock", { isInStock: false }],
    ] as const)("is disabled when %s is false", (_name, override) => {
      const { isAddToCartDisabled } = useCompareAddToCart();
      const p = product({
        availabilityData: { isActive: true, isAvailable: true, isBuyable: true, isInStock: true, ...override },
      } as unknown as Partial<Product>);

      expect(isAddToCartDisabled(p)).toBe(true);
    });

    it("is disabled when availableQuantity is less than the quantity to add", () => {
      const { isAddToCartDisabled } = useCompareAddToCart();
      const p = product({ minQuantity: 5, availabilityData: { ...product().availabilityData, availableQuantity: 4 } });

      expect(isAddToCartDisabled(p)).toBe(true);
    });

    it("is enabled when availableQuantity exactly matches the quantity to add", () => {
      const { isAddToCartDisabled } = useCompareAddToCart();
      const p = product({ minQuantity: 5, availabilityData: { ...product().availabilityData, availableQuantity: 5 } });

      expect(isAddToCartDisabled(p)).toBe(false);
    });

    it("is disabled when maxQuantity is less than the quantity to add", () => {
      const { isAddToCartDisabled } = useCompareAddToCart();
      const p = product({ minQuantity: 5, maxQuantity: 4 });

      expect(isAddToCartDisabled(p)).toBe(true);
    });

    it("is enabled when the pack-size-aligned quantity still fits within availableQuantity", () => {
      const { isAddToCartDisabled } = useCompareAddToCart();
      // minQuantity unset (defaults to 1) rounds up to packSize (6), which fits in 10 available.
      const p = product({
        minQuantity: undefined,
        packSize: 6,
        availabilityData: { ...product().availabilityData, availableQuantity: 10 },
      });

      expect(isAddToCartDisabled(p)).toBe(false);
    });

    it("is disabled when the pack-size-aligned quantity no longer fits within availableQuantity", () => {
      const { isAddToCartDisabled } = useCompareAddToCart();
      // minQuantity=8, packSize=6 aligns up to 12, which exceeds the 10 available.
      const p = product({
        minQuantity: 8,
        packSize: 6,
        availabilityData: { ...product().availabilityData, availableQuantity: 10 },
      });

      expect(isAddToCartDisabled(p)).toBe(true);
    });

    // Both cases below cover rules useQuantityValidationSchema owns (see PR review discussion) —
    // enforcing them through the shared schema instead of a hand-rolled copy is the point: it's
    // impossible for compare to silently drift from QuantityControl's actual behavior again.
    it("does not block on availableQuantity === 0 alone — matches useQuantityValidationSchema's own `if (availableQuantity?.value)` (0 is falsy)", () => {
      const { isAddToCartDisabled } = useCompareAddToCart();
      const p = product({
        minQuantity: 1,
        availabilityData: { ...product().availabilityData, availableQuantity: 0 },
      });

      expect(isAddToCartDisabled(p)).toBe(false);
    });

    it("is disabled once the quantity exceeds LINE_ITEM_QUANTITY_LIMIT, enforced by the schema and not re-implemented here", () => {
      const { isAddToCartDisabled } = useCompareAddToCart();
      const p = product({ minQuantity: 1_000_000 });

      expect(isAddToCartDisabled(p)).toBe(true);
    });
  });

  describe("onAddToCart", () => {
    it("adds the pack-size-aligned quantity, not the raw minQuantity", async () => {
      hoisted.addToCart.mockResolvedValue({ validationErrors: [] });
      const { onAddToCart } = useCompareAddToCart();

      // minQuantity=10, packSize=6 -> aligned quantity is 12.
      await onAddToCart(item({ id: "p1", minQuantity: 10, packSize: 6 }));

      expect(hoisted.addToCart).toHaveBeenCalledWith("p1", 12);
    });

    it("tracks analytics and the historical event, and shows a success toast, on a genuine success", async () => {
      hoisted.addToCart.mockResolvedValue({ validationErrors: [] });
      const { onAddToCart } = useCompareAddToCart();
      const it_ = item({ id: "p1", name: "Widget" });

      await onAddToCart(it_);

      expect(hoisted.trackAddItemToCart).toHaveBeenCalledWith(it_.product, 1, { source_block: "compare" });
      expect(hoisted.pushHistoricalEvent).toHaveBeenCalledWith({ eventType: "addToCart", productId: "p1" });
      expect(hoisted.success).toHaveBeenCalledTimes(1);
      expect(hoisted.error).not.toHaveBeenCalled();
    });

    it("shows an error toast and skips analytics when the cart response has a matching validation error", async () => {
      hoisted.addToCart.mockResolvedValue({
        validationErrors: [
          {
            objectId: "p1",
            objectType: ValidationErrorObjectType.CatalogProduct,
            errorMessage: "Out of stock",
          } as ValidationErrorType,
        ],
      });
      const { onAddToCart } = useCompareAddToCart();

      await onAddToCart(item({ id: "p1" }));

      expect(hoisted.error).toHaveBeenCalledTimes(1);
      expect(hoisted.success).not.toHaveBeenCalled();
      expect(hoisted.trackAddItemToCart).not.toHaveBeenCalled();
      expect(hoisted.pushHistoricalEvent).not.toHaveBeenCalled();
    });

    it("shows an error toast when addToCart resolves to nothing (request failed)", async () => {
      hoisted.addToCart.mockResolvedValue(undefined);
      const { onAddToCart } = useCompareAddToCart();

      await onAddToCart(item({ id: "p1" }));

      expect(hoisted.error).toHaveBeenCalledTimes(1);
      expect(hoisted.success).not.toHaveBeenCalled();
    });

    it("ignores validation errors that belong to a different object", async () => {
      hoisted.addToCart.mockResolvedValue({
        validationErrors: [
          {
            objectId: "some-other-product",
            objectType: ValidationErrorObjectType.CatalogProduct,
          } as ValidationErrorType,
        ],
      });
      const { onAddToCart } = useCompareAddToCart();

      await onAddToCart(item({ id: "p1" }));

      expect(hoisted.success).toHaveBeenCalledTimes(1);
      expect(hoisted.error).not.toHaveBeenCalled();
    });
  });

  describe("isAddingToCart / per-entry loading state", () => {
    it("is true only while that entry's add is in flight", async () => {
      const { promise, resolve } = deferred<CartType>();
      hoisted.addToCart.mockReturnValue(promise);
      const { onAddToCart, isAddingToCart } = useCompareAddToCart();
      const it_ = item({ id: "p1" });

      expect(isAddingToCart(it_)).toBe(false);
      const pending = onAddToCart(it_);
      expect(isAddingToCart(it_)).toBe(true);

      resolve({ validationErrors: [] } as unknown as CartType);
      await pending;

      expect(isAddingToCart(it_)).toBe(false);
    });

    it("a second click on the same entry while in flight is a no-op", async () => {
      const { promise, resolve } = deferred<CartType>();
      hoisted.addToCart.mockReturnValue(promise);
      const { onAddToCart } = useCompareAddToCart();
      const it_ = item({ id: "p1" });

      const first = onAddToCart(it_);
      const second = onAddToCart(it_);

      resolve({ validationErrors: [] } as unknown as CartType);
      await Promise.all([first, second]);

      expect(hoisted.addToCart).toHaveBeenCalledTimes(1);
    });

    it("does not block a different entry (e.g. a different configuration of the same product)", async () => {
      const { promise, resolve } = deferred<CartType>();
      hoisted.addToCart.mockReturnValue(promise);
      const { onAddToCart, isAddingToCart } = useCompareAddToCart();
      const itemA = item({ id: "p1" }, "config-a");
      const itemB = item({ id: "p1" }, "config-b");

      const pending = onAddToCart(itemA);
      expect(isAddingToCart(itemA)).toBe(true);
      expect(isAddingToCart(itemB)).toBe(false);

      resolve({ validationErrors: [] } as unknown as CartType);
      await pending;
    });
  });
});
