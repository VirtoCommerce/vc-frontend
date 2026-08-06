import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCoupon } from "./useCoupon";

const validateCartCouponMock = vi.hoisted(() => vi.fn());
const addCartCouponMock = vi.hoisted(() => vi.fn());
const removeCartCouponMock = vi.hoisted(() => vi.fn());
const cartMock = vi.hoisted(() => ({ value: undefined as Record<string, unknown> | undefined }));

vi.mock("@/shared/cart/composables/useCart", () => ({
  useFullCart: () => ({
    cart: cartMock,
    validateCartCoupon: validateCartCouponMock,
    addCartCoupon: addCartCouponMock,
    removeCartCoupon: removeCartCouponMock,
  }),
}));

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
});
