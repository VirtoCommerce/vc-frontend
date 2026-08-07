import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";

const validateCartCouponMock = vi.hoisted(() => vi.fn());
const addCartCouponMock = vi.hoisted(() => vi.fn());
const removeCartCouponMock = vi.hoisted(() => vi.fn());
// A real ref, so `appliedCouponCode` (a computed) sees cart changes made by the mutation mocks.
const cartMock = ref<Record<string, unknown> | undefined>();

vi.mock("@/shared/cart/composables/useCart", () => ({
  useFullCart: () => ({
    cart: cartMock,
    validateCartCoupon: validateCartCouponMock,
    addCartCoupon: addCartCouponMock,
    removeCartCoupon: removeCartCouponMock,
  }),
}));

// Imported lazily: the hoisted vi.mock factory closes over `cartMock`, which must exist first.
const { useCoupon } = await import("./useCoupon");

function setAppliedCoupon(code: string) {
  cartMock.value = { coupons: [{ code, isAppliedSuccessfully: true }] };
}

describe("useCoupon", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cartMock.value = undefined;
  });

  describe("applyCoupon replacing an already-applied coupon", () => {
    it("should NOT remove the working coupon when the replacement is invalid", async () => {
      setAppliedCoupon("QA");
      validateCartCouponMock.mockResolvedValueOnce(false);

      const { applyCoupon, couponError } = useCoupon();
      await applyCoupon("FriDAY");

      expect(removeCartCouponMock).not.toHaveBeenCalled();
      expect(addCartCouponMock).not.toHaveBeenCalled();
      expect(couponError.value).toEqual({ code: "FriDAY", type: "invalid" });
    });

    it("should validate the new code BEFORE touching the working coupon", async () => {
      setAppliedCoupon("QA");
      const callOrder: string[] = [];
      validateCartCouponMock.mockImplementationOnce(async () => {
        callOrder.push("validate");
        return true;
      });
      removeCartCouponMock.mockImplementationOnce(async () => {
        callOrder.push("remove");
      });

      const { applyCoupon } = useCoupon();
      await applyCoupon("FriDAY");

      expect(callOrder).toEqual(["validate", "remove"]);
    });

    it("should still replace the working coupon when the new code is valid", async () => {
      setAppliedCoupon("QA");
      validateCartCouponMock.mockResolvedValueOnce(true);

      const { applyCoupon } = useCoupon();
      await applyCoupon("FriDAY");

      expect(removeCartCouponMock).toHaveBeenCalledWith("QA");
      expect(addCartCouponMock).toHaveBeenCalledWith("FriDAY");
    });

    it("should NOT remove/re-add when re-applying the same already-applied code", async () => {
      setAppliedCoupon("QA");
      validateCartCouponMock.mockResolvedValueOnce(true);

      const { applyCoupon } = useCoupon();
      await applyCoupon("QA");

      expect(removeCartCouponMock).not.toHaveBeenCalled();
      expect(addCartCouponMock).toHaveBeenCalledWith("QA");
    });

    // The backend matches codes case-insensitively, so a case variant is the same coupon —
    // treating it as a swap would risk dropping the working coupon if the re-add fails.
    it("should NOT remove the working coupon when re-applying it in a different case", async () => {
      setAppliedCoupon("FRIDAY");
      validateCartCouponMock.mockResolvedValueOnce(true);

      const { applyCoupon } = useCoupon();
      await applyCoupon("friday");

      expect(removeCartCouponMock).not.toHaveBeenCalled();
    });
  });

  describe("applyCoupon with no coupon currently applied", () => {
    it("should add the coupon without attempting a remove", async () => {
      validateCartCouponMock.mockResolvedValueOnce(true);

      const { applyCoupon } = useCoupon();
      await applyCoupon("FIXED5");

      expect(removeCartCouponMock).not.toHaveBeenCalled();
      expect(addCartCouponMock).toHaveBeenCalledWith("FIXED5");
    });
  });

  // The mutation resolving is not proof anything changed: a valid reward can yield no discount,
  // and removing an absent code is a backend no-op. The returned boolean must reflect the cart.
  describe("applyCoupon outcome", () => {
    it("should return true when the cart shows the coupon applied, matched case-insensitively", async () => {
      validateCartCouponMock.mockResolvedValueOnce(true);
      addCartCouponMock.mockImplementationOnce(async () => setAppliedCoupon("FRIDAY"));

      const { applyCoupon } = useCoupon();

      await expect(applyCoupon("FriDAY")).resolves.toBe(true);
    });

    it("should return false and report the code invalid when the mutation resolves without applying it", async () => {
      validateCartCouponMock.mockResolvedValueOnce(true);
      addCartCouponMock.mockResolvedValueOnce(undefined);

      const { applyCoupon, couponError } = useCoupon();

      await expect(applyCoupon("GHOST")).resolves.toBe(false);
      expect(couponError.value).toEqual({ code: "GHOST", type: "invalid" });
    });
  });

  describe("removeCoupon outcome", () => {
    it("should return true when the coupon is gone from the cart", async () => {
      setAppliedCoupon("QA");
      removeCartCouponMock.mockImplementationOnce(async () => {
        cartMock.value = { coupons: [] };
      });

      const { removeCoupon } = useCoupon();

      await expect(removeCoupon("QA")).resolves.toBe(true);
    });

    it("should return false when the backend no-ops and the coupon stays applied", async () => {
      setAppliedCoupon("QA");
      removeCartCouponMock.mockResolvedValueOnce(undefined);

      const { removeCoupon } = useCoupon();

      await expect(removeCoupon("QA")).resolves.toBe(false);
    });
  });
});
