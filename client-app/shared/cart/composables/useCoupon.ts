import { computed, readonly, ref } from "vue";
import { useFullCart } from "@/shared/cart/composables/useCart";

const errorCouponCode = ref<string>();
const loadingCouponCode = ref<string>();

export function useCoupon() {
  const { cart, validateCartCoupon, addCartCoupon, removeCartCoupon } = useFullCart();

  const appliedCouponCode = computed(
    () => cart.value?.coupons?.find((coupon) => coupon.isAppliedSuccessfully)?.code ?? undefined,
  );

  function clearError() {
    errorCouponCode.value = undefined;
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
        errorCouponCode.value = trimmed;
        return;
      }

      await addCartCoupon(trimmed);
    } finally {
      loadingCouponCode.value = undefined;
    }
  }

  async function removeCoupon(code: string) {
    const trimmed = code.trim();
    if (!trimmed) {
      return;
    }

    try {
      loadingCouponCode.value = trimmed;

      await removeCartCoupon(trimmed);
    } finally {
      loadingCouponCode.value = undefined;
    }
  }

  return {
    appliedCouponCode,
    errorCouponCode: readonly(errorCouponCode),
    loadingCouponCode: readonly(loadingCouponCode),
    applyCoupon,
    removeCoupon,
    clearError,
  };
}
