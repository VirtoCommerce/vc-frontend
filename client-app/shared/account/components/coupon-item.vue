<template>
  <div class="coupon-item">
    <div class="coupon-item__title">
      <p>{{ coupon.systemName }}</p>
    </div>

    <div class="coupon-item__name">
      <p>{{ coupon.name }}</p>
    </div>

    <div class="coupon-item__description">
      <p>{{ coupon.description }}</p>
    </div>

    <div class="coupon-item__end-date">
      <template v-if="coupon.endDate">
        <span class="coupon-item__end-date-label">{{ $t("shared.account.promotion_coupons.expired") }}</span>

        <span class="coupon-item__end-date-value">{{ $d(coupon.endDate, "short") }}</span>
      </template>
    </div>

    <button type="button" class="coupon-item__code" @click="copyCoupon(coupon.couponCode)">
      <span class="coupon-item__code-value">{{ coupon.couponCode }}</span>

      <span class="coupon-item__code-label">{{ $t("shared.account.promotion_coupons.click_to_copy") }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useClipboard } from "@vueuse/core";
import type { PromotionCouponType } from "@/core/api/graphql/types";

interface IProps {
  coupon: PromotionCouponType;
}

defineProps<IProps>();

const { copy, isSupported } = useClipboard();

async function copyCoupon(text?: string) {
  if (isSupported && text?.trim()) {
    await copy(text);
  }
}
</script>
