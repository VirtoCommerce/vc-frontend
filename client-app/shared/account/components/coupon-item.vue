<template>
  <div class="coupon-item">
    <div class="coupon-item__title">
      <p>{{ coupon.systemName }}</p>
    </div>

    <div class="coupon-item__name">
      <p>{{ coupon.name }}</p>
    </div>

    <div class="coupon-item__description">
      <p class="coupon-item__description-text">{{ coupon.description }}</p>
    </div>

    <div class="coupon-item__end-date">
      <template v-if="coupon.endDate">
        <span class="coupon-item__end-date-label">{{ $t("shared.account.promotion_coupons.expired") }}</span>

        <span class="coupon-item__end-date-value">{{ $d(coupon.endDate, "short") }}</span>
      </template>
    </div>

    <div class="coupon-item__code">
      <button type="button" class="coupon-item__code-button" @click="copyCoupon(coupon.couponCode?.toUpperCase())">
        <span class="coupon-item__code-value">{{ coupon.couponCode?.toUpperCase() }}</span>

        <span class="coupon-item__code-label coupon-item__code-label--click">
          {{ $t("shared.account.promotion_coupons.click_to_copy") }}
        </span>

        <span class="coupon-item__code-label coupon-item__code-label--tap">
          {{ $t("shared.account.promotion_coupons.tap_to_copy") }}
        </span>
      </button>
    </div>
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

<style lang="scss">
.coupon-item {
  @apply bg-additional-50 rounded-md shadow-md p-4 grid grid-cols-3 lg:grid-cols-12 gap-4 lg:gap-5;

  &__title {
    @apply order-1 col-span-1 lg:order-none lg:col-span-2 flex items-center justify-center font-bold text-xl text-success-500;
  }

  &__name {
    @apply order-2 col-span-2 lg:order-none lg:col-span-3 flex items-center font-bold border-l border-neutral-300 pl-4 lg:border-l-0 lg:pl-0;
  }

  &__description {
    @apply order-3 col-span-3 lg:col-span-3 2xl:col-span-4 lg:order-none hidden lg:flex items-center text-sm;

    &-text {
      @apply line-clamp-4;
    }
  }

  &__end-date {
    @apply order-last col-span-3 lg:col-span-2 2xl:col-span-1 lg:order-none -mt-2.5 lg:mt-0 flex items-center justify-center text-center lg:flex-col text-xs gap-1;

    &-label {
      @apply text-neutral-600;
    }

    &-value {
      @apply font-bold;
    }
  }

  &__code {
    @apply order-4 col-span-3 lg:order-none lg:col-span-2 flex items-center;

    &-value {
      @apply font-bold uppercase leading-5;
    }

    &-label {
      @apply text-xs text-secondary-500;

      &--click {
        @apply hidden lg:inline;
      }

      &--tap {
        @apply lg:hidden;
      }
    }

    &-button {
      @apply w-full bg-secondary-50 border transition-colors border-dashed border-secondary-400 px-2.5 py-3 rounded flex flex-col;

      &:hover {
        @apply bg-secondary-100;
      }
    }
  }
}
</style>
