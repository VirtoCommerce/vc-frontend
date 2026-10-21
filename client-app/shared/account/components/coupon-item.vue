<template>
  <VcWidget :class="['coupon-item', { 'coupon-item--compact': compact }]" :shadow="!compact">
    <template #default-container>
      <div class="coupon-item__wrapper">
        <div class="coupon-item__title">
          <p>{{ coupon.label }}</p>
        </div>

        <div class="coupon-item__name">
          <p>{{ coupon.name }}</p>
        </div>

        <div class="coupon-item__description">
          <p class="coupon-item__description-text">{{ coupon.description }}</p>

          <!-- Extra line under the description (e.g. uses left in a plugin). Facade contract: keep the slot name. -->
          <slot name="description-append" />
        </div>

        <div class="coupon-item__end-date">
          <template v-if="coupon.endDate">
            <span class="coupon-item__end-date-label">{{ $t("shared.account.promotion_coupons.expires") }}</span>

            <span class="coupon-item__end-date-value">{{ $d(coupon.endDate, "short") }}</span>
          </template>
        </div>

        <div class="coupon-item__code">
          <button type="button" class="coupon-item__code-button" @click="copyCoupon(coupon.couponCode?.toUpperCase())">
            <span class="coupon-item__code-value">{{ coupon.couponCode?.toUpperCase() }}</span>

            <span class="coupon-item__click-label">
              {{ $t("shared.account.promotion_coupons.click_to_copy") }}
            </span>

            <span class="coupon-item__tap-label">
              {{ $t("shared.account.promotion_coupons.tap_to_copy") }}
            </span>
          </button>
        </div>
      </div>
    </template>
  </VcWidget>
</template>

<script setup lang="ts">
import { useClipboard } from "@vueuse/core";
import { useI18n } from "vue-i18n";
import { useNotifications } from "@/shared/notification";
import type { PromotionCouponType } from "@/core/api/graphql/types";

interface IProps {
  coupon: PromotionCouponType;
  // Narrow containers (e.g. a widget column): name, description and expiry stack between the label and the code.
  compact?: boolean;
}

withDefaults(defineProps<IProps>(), { compact: false });

const { t } = useI18n();
const { copy, isSupported } = useClipboard();
const notifications = useNotifications();

async function copyCoupon(text?: string) {
  if (isSupported && text?.trim()) {
    await copy(text);
    notifications.success({
      text: t("shared.account.promotion_coupons.clipboard_success"),
      duration: 4000,
      single: true,
    });
  }
}
</script>

<style lang="scss">
.coupon-item {
  $self: &;

  &__wrapper {
    @apply p-4 grid grid-cols-3 gap-4;

    @media (min-width: theme("screens.lg")) {
      @apply grid-cols-12 gap-5;
    }
  }

  &__title {
    @apply order-1 col-span-1 flex items-center justify-center font-bold text-xl text-success-500 text-center;

    @media (min-width: theme("screens.lg")) {
      @apply order-none col-span-2;
    }
  }

  &__name {
    @apply order-2 col-span-2 flex items-center font-bold border-l border-neutral-300 pl-4;

    @media (min-width: theme("screens.lg")) {
      @apply order-none col-span-3 border-l-0 pl-0;
    }
  }

  &__description {
    @apply order-3 col-span-3 hidden flex-col justify-center text-sm;

    @media (min-width: theme("screens.lg")) {
      @apply order-none col-span-3 flex;
    }

    @media (min-width: theme("screens.2xl")) {
      @apply col-span-4;
    }
  }

  &__description-text {
    @apply line-clamp-4;
  }

  &__end-date {
    @apply order-last col-span-3 -mt-2.5 flex items-center justify-center text-center text-xs gap-1;

    @media (min-width: theme("screens.lg")) {
      @apply order-none col-span-2 mt-0 flex-col;
    }

    @media (min-width: theme("screens.2xl")) {
      @apply col-span-1;
    }
  }

  &__end-date-label {
    @apply text-neutral-600;
  }

  &__end-date-value {
    @apply font-bold;
  }

  &__code {
    @apply order-4 col-span-3 flex items-center;

    @media (min-width: theme("screens.lg")) {
      @apply order-none col-span-2;
    }
  }

  &__code-value {
    @apply font-bold uppercase leading-5;

    // Not break-words: "anywhere" also lowers the min-content width, so a long code can't widen the grid column.
    overflow-wrap: anywhere;
  }

  &__code-button {
    @apply w-full bg-secondary-50 border transition-colors border-dashed border-secondary-400 px-2.5 py-3 rounded flex flex-col;

    &:hover {
      @apply bg-secondary-100;
    }
  }

  &__click-label {
    @apply text-xs text-secondary-500;

    @media (pointer: coarse) {
      @apply hidden;
    }
  }

  &__tap-label {
    @apply hidden text-xs text-secondary-500;

    @media (pointer: coarse) {
      @apply inline;
    }
  }

  // Compact: everything stacked under the label on small screens; label | name, description, expiry | code on large.
  // Placement only, so the markup — and the slot — stay the same in both modes.
  &--compact {
    #{$self}__wrapper {
      @apply flex flex-col gap-y-1;

      // Same 12 columns as the regular layout: label 2, text 7, code 3 (one more than the regular card's 2).
      @media (min-width: theme("screens.lg")) {
        @apply grid grid-cols-12 gap-x-5 gap-y-1;
      }
    }

    #{$self}__title {
      @apply order-none justify-start text-start;

      @media (min-width: theme("screens.lg")) {
        @apply col-span-2 col-start-1 row-span-3 row-start-1 justify-center text-center;
      }
    }

    #{$self}__name {
      @apply order-none border-l-0 pl-0;

      @media (min-width: theme("screens.lg")) {
        @apply col-span-7 col-start-3 row-start-1;
      }
    }

    #{$self}__description {
      @apply order-none flex;

      @media (min-width: theme("screens.lg")) {
        @apply col-span-7 col-start-3 row-start-2;
      }
    }

    #{$self}__end-date {
      @apply order-none mt-0 flex-row justify-start text-start;

      @media (min-width: theme("screens.lg")) {
        @apply col-span-7 col-start-3 row-start-3;
      }
    }

    #{$self}__code {
      @apply order-none mt-2;

      @media (min-width: theme("screens.lg")) {
        @apply col-span-3 col-start-10 row-span-3 row-start-1 mt-0;
      }
    }
  }
}
</style>
