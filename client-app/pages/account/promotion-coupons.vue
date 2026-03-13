<template>
  <div class="promotion-coupons">
    <VcTypography tag="h1">
      {{ $t("pages.account.promotion_coupons.title") }}
    </VcTypography>

    <div v-if="loading" class="promotion-coupons__wrapper">
      <CouponItemSkeleton v-for="item in 5" :key="item" />
    </div>

    <div v-else-if="coupons.length" class="promotion-coupons__wrapper">
      <CouponItem v-for="coupon in coupons" :key="coupon.id" :coupon="coupon" />

      <VcPagination v-if="pagesCount > 1" v-model:page="page" :pages="pagesCount" />
    </div>

    <VcEmptyView v-else :text="$t('pages.account.promotion_coupons.no_lists')" icon="outline-lists" />
  </div>
</template>

<script setup lang="ts">
import { CouponItem, usePromotionCoupons } from "@/shared/account";
import CouponItemSkeleton from "@/shared/account/components/coupon-item-skeleton.vue";

const { loading, coupons, page, pagesCount } = usePromotionCoupons();
</script>

<style lang="scss">
.promotion-coupons {
  &__wrapper {
    @apply space-y-2.5;
  }
}
</style>
