import { computed, readonly, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useFullCart } from "@/shared/cart/composables/useFullCart";
import type { CouponType } from "@/core/api/graphql/types";

const couponCode = ref("");
const validationError = ref("");

export function useCoupon() {
  const { t } = useI18n();
  const { cart, validateCartCoupon, addCartCoupon, removeCartCoupon } = useFullCart();

  const INVALID_COUPON_MESSAGE = t("common.messages.invalid_coupon");

  const firstCouponInCart = computed<CouponType | undefined>(() => cart.value?.coupons?.[0]);
  const isApplied = computed<boolean>(() => Boolean(firstCouponInCart.value?.isAppliedSuccessfully));

  const trimmedCoupon = computed(() => {
    return couponCode.value.trim();
  });

  function clearValidationError() {
    validationError.value = "";
  }

  async function applyCoupon() {
    clearValidationError();

    if (!trimmedCoupon.value) {
      return;
    }

    const validationResult = await validateCartCoupon(trimmedCoupon.value);

    if (validationResult) {
      await addCartCoupon(trimmedCoupon.value);
    } else {
      validationError.value = INVALID_COUPON_MESSAGE;
    }
  }

  async function removeCoupon() {
    if (!trimmedCoupon.value) {
      return;
    }

    await removeCartCoupon(trimmedCoupon.value);
  }

  watchEffect(() => {
    couponCode.value = firstCouponInCart.value?.code ?? "";
  });

  return {
    couponCode,
    applyCoupon,
    removeCoupon,
    couponIsApplied: isApplied,
    clearCouponValidationError: clearValidationError,
    couponValidationError: readonly(validationError),
  };
}
