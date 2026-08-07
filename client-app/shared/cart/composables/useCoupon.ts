import { computed, readonly, ref } from "vue";
import { useFullCart } from "@/shared/cart/composables/useCart";

type ErrorType = "invalid" | "failed";
type CouponErrorType = { code: string; type: ErrorType };

const COUPON_ERROR_TIMEOUT = 7000;

const couponError = ref<CouponErrorType>();
const loadingCouponCode = ref<string>();
let couponErrorTimeoutId: ReturnType<typeof setTimeout> | undefined;

export function useCoupon() {
  const { cart, validateCartCoupon, addCartCoupon, removeCartCoupon } = useFullCart();

  const appliedCouponCode = computed(
    () => cart.value?.coupons?.find((coupon) => coupon.isAppliedSuccessfully)?.code ?? undefined,
  );

  function clearError() {
    clearTimeout(couponErrorTimeoutId);
    couponErrorTimeoutId = undefined;
    couponError.value = undefined;
  }

  function setError(error: CouponErrorType) {
    clearTimeout(couponErrorTimeoutId);
    couponError.value = error;
    couponErrorTimeoutId = setTimeout(clearError, COUPON_ERROR_TIMEOUT);
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

      // The new coupon is validated BEFORE the applied one is removed, so an invalid code can't
      // silently drop a working coupon (VCST-5518).
      const isValid = await validateCartCoupon(trimmed);
      if (!isValid) {
        setError({ code: trimmed, type: "invalid" });
        return false;
      }

      if (appliedCouponCode.value && appliedCouponCode.value !== trimmed) {
        await removeCartCoupon(appliedCouponCode.value);
      }

      await addCartCoupon(trimmed);

      return true;
    } catch {
      setError({ code: trimmed, type: "failed" });

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
      setError({ code: trimmed, type: "failed" });

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
