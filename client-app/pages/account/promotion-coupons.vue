<template>
  <div class="promotion-coupons">
    <VcTypography tag="h1">
      {{ $t("pages.account.promotion_coupons.title") }}
    </VcTypography>

    <div v-if="result?.promotionCoupons?.items" class="promotion-coupons__wrapper">
      <div v-for="coupon in result.promotionCoupons.items" :key="coupon.id" class="coupon-item">
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
            <span class="coupon-item__end-date-label">Expired</span>

            <span class="coupon-item__end-date-value">{{ $d(coupon.endDate, "short") }}</span>
          </template>
        </div>

        <button type="button" class="coupon-item__code" @click="copyCoupon(coupon.couponCode)">
          <span class="coupon-item__code-value">{{ coupon.couponCode }}</span>

          <span class="coupon-item__code-label">Click to copy</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useClipboard } from "@vueuse/core";
import { getPromotionCoupons } from "@/core/api/graphql";

const { result } = getPromotionCoupons();

const { copy, isSupported } = useClipboard();

async function copyCoupon(text?: string) {
  if (isSupported && text?.trim()) {
    await copy(text);
  }
}
</script>

<style lang="scss">
.promotion-coupons {
  &__wrapper {
    @apply space-y-2.5;
  }
}
.coupon-item {
  @apply bg-additional-50 rounded-md shadow-md p-4 grid grid-cols-12 gap-5;

  &__title {
    @apply col-span-2 flex items-center font-bold text-xl text-success-500;
  }

  &__name {
    @apply col-span-2 flex items-center font-bold;
  }

  &__description {
    @apply col-span-5 flex items-center text-sm;
  }

  &__end-date {
    @apply col-span-1 flex items-center justify-center text-center flex-col text-xs gap-1;

    &-label {
      @apply text-neutral-600;
    }

    &-value {
      @apply font-bold;
    }
  }

  &__code {
    @apply bg-secondary-50 col-span-2 border transition-colors border-dashed border-secondary-400 px-2.5 py-3 rounded flex flex-col;

    &:hover {
      @apply bg-secondary-100;
    }

    &-value {
      @apply font-bold;
    }

    &-label {
      @apply text-sm text-secondary-500;
    }
  }
}
</style>
