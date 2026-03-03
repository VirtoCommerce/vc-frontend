<template>
  <div class="promotion-coupons">
    <VcTypography tag="h1">
      {{ $t("pages.account.promotion_coupons.title") }}
    </VcTypography>

    <div v-if="result?.promotionCoupons?.items" class="promotion-coupons__wrapper">
      <CouponItem v-for="coupon in result.promotionCoupons.items" :key="coupon.id" :coupon="coupon" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { getPromotionCoupons } from "@/core/api/graphql";
import { CouponItem } from "@/shared/account";

const { result } = getPromotionCoupons();
</script>

<style lang="scss">
.promotion-coupons {
  &__wrapper {
    @apply space-y-2.5;
  }
}
</style>
