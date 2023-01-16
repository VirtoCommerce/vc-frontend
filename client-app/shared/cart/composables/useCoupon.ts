import { computed, readonly, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { useCart } from "@/shared/cart";
import { CouponType } from "@/xapi";

const couponCode = ref("");
const validationError = ref("");

export default function useCoupon() {
  const { t } = useI18n();
  const { cart, validateCartCoupon, addCartCoupon, removeCartCoupon } = useCart();

  const INVALID_COUPON_MESSAGE = t("pages.checkout.invalid_coupon_message");

  const firstCouponInCart = computed<CouponType | undefined>(() => cart.value.coupons?.[0]);
  const isApplied = computed<boolean>(() => Boolean(firstCouponInCart.value?.isAppliedSuccessfully));

  function clearValidationError() {
    validationError.value = "";
  }

  async function applyCoupon() {
    clearValidationError();

    const validationResult: boolean = await validateCartCoupon(couponCode.value);

    if (validationResult) {
      await addCartCoupon(couponCode.value);
    } else {
      validationError.value = INVALID_COUPON_MESSAGE;
    }
  }

  async function removeCoupon() {
    await removeCartCoupon(couponCode.value);
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
