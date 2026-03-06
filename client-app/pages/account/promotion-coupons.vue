<template>
  <div class="promotion-coupons">
    <VcTypography tag="h1">
      {{ $t("pages.account.promotion_coupons.title") }}
    </VcTypography>

    <div v-if="loading" class="promotion-coupons__wrapper">
      <CouponItemSkeleton v-for="item in 5" :key="item" />
    </div>

    <div v-else-if="result?.promotionCoupons?.items?.length" class="promotion-coupons__wrapper">
      <CouponItem v-for="coupon in result.promotionCoupons.items" :key="coupon.id" :coupon="coupon" />
    </div>

    <VcEmptyView v-else :text="$t('pages.account.promotion_coupons.no_lists')" icon="outline-lists" />
  </div>
</template>

<script setup lang="ts">
import { getPromotionCoupons } from "@/core/api/graphql";
import { CouponItem } from "@/shared/account";
import CouponItemSkeleton from "@/shared/account/components/coupon-item-skeleton.vue";

const { result, loading } = getPromotionCoupons();
</script>

<style lang="scss">
.promotion-coupons {
  &__wrapper {
    @apply space-y-2.5;
  }
}
</style>
