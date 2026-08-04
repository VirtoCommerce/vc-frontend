import { computed, readonly, ref } from "vue";
import { useFullCart } from "@/shared/cart/composables/useCart";

type ErrorType = "invalid" | "failed";
type CouponErrorType = { code: string; type: ErrorType };

const couponError = ref<CouponErrorType>();
const loadingCouponCode = ref<string>();

export function useCoupon() {
  const { cart, validateCartCoupon, addCartCoupon, removeCartCoupon } = useFullCart();

  const appliedCouponCode = computed(
    () => cart.value?.coupons?.find((coupon) => coupon.isAppliedSuccessfully)?.code ?? undefined,
  );

  function clearError() {
    couponError.value = undefined;
  }

  // Returns this call's own outcome: `couponError` is module-level, so a concurrent operation on
  // another card can clear or overwrite it before the caller reads it.
  async function applyCoupon(code: string): Promise<boolean> {
    clearError();

    const trimmed = code.trim();
    if (!trimmed) {
      return false;
    }

    try {
      loadingCouponCode.value = trimmed;

      if (appliedCouponCode.value && appliedCouponCode.value !== trimmed) {
        await removeCartCoupon(appliedCouponCode.value);
      }

      const isValid = await validateCartCoupon(trimmed);
      if (!isValid) {
        couponError.value = { code: trimmed, type: "invalid" };
        return false;
      }

      await addCartCoupon(trimmed);

      return true;
    } catch {
      couponError.value = { code: trimmed, type: "failed" };

      return false;
    } finally {
      loadingCouponCode.value = undefined;
    }
  }

  async function removeCoupon(code: string): Promise<boolean> {
    clearError();

    const trimmed = code.trim();
    if (!trimmed) {
      return false;
    }

    try {
      loadingCouponCode.value = trimmed;

      await removeCartCoupon(trimmed);

      return true;
    } catch {
      couponError.value = { code: trimmed, type: "failed" };

      return false;
    } finally {
      loadingCouponCode.value = undefined;
    }
  }

  return {
    appliedCouponCode,
    couponError: readonly(couponError),
    loadingCouponCode: readonly(loadingCouponCode),
    applyCoupon,
    removeCoupon,
    clearError,
  };
}
