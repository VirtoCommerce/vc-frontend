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

  async function applyCoupon(code: string) {
    clearError();

    const trimmed = code.trim();
    if (!trimmed) {
      return;
    }

    try {
      loadingCouponCode.value = trimmed;

      if (appliedCouponCode.value && appliedCouponCode.value !== trimmed) {
        await removeCartCoupon(appliedCouponCode.value);
      }

      const isValid = await validateCartCoupon(trimmed);
      if (!isValid) {
        couponError.value = { code: trimmed, type: "invalid" };
        return;
      }

      await addCartCoupon(trimmed);
    } catch {
      couponError.value = { code: trimmed, type: "failed" };
    } finally {
      loadingCouponCode.value = undefined;
    }
  }

  async function removeCoupon(code: string) {
    clearError();

    const trimmed = code.trim();
    if (!trimmed) {
      return;
    }

    try {
      loadingCouponCode.value = trimmed;

      await removeCartCoupon(trimmed);
    } catch {
      couponError.value = { code: trimmed, type: "failed" };
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
