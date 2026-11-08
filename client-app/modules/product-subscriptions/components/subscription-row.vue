<template>
  <router-link
    :to="{ name: SUBSCRIPTION_DETAILS_ROUTE_NAME, params: { subscriptionId: subscription.id } }"
    class="subscription-row"
    :data-test-id="`subscription-row-${subscription.number}`"
  >
    <span class="subscription-row__thumb">
      <VcImage
        :src="subscription.imageUrl"
        :alt="subscription.productName ?? ''"
        class="subscription-row__image"
        lazy
      />
    </span>

    <div class="subscription-row__main">
      <div class="subscription-row__title">{{ subscription.productName }}</div>

      <div class="subscription-row__meta">
        <span>{{ $t("product_subscriptions.common.qty", { quantity: subscription.quantity }) }}</span>

        <span>· {{ intervalLabel($t, subscription.intervalUnit, subscription.intervalCount) }}</span>

        <span v-if="savings">· {{ savings }}</span>
      </div>
    </div>

    <div class="subscription-row__side">
      <SubscriptionStatusBadge :status="subscription.status" />

      <span class="subscription-row__next">
        <template v-if="subscription.status === 'Active' || subscription.status === 'PastDue'">
          {{
            $t("product_subscriptions.common.next", {
              date: $d(new Date(subscription.nextOrderDate), "short"),
            })
          }}
        </template>

        <template v-else-if="subscription.status === 'Paused'">
          {{
            subscription.pausedUntil
              ? $t("product_subscriptions.common.paused_until", {
                  date: $d(new Date(subscription.pausedUntil), "short"),
                })
              : $t("product_subscriptions.common.paused")
          }}
        </template>

        <template v-else-if="subscription.status === 'Cancelled' && subscription.cancelledDate">
          {{
            $t("product_subscriptions.common.cancelled_on", {
              date: $d(new Date(subscription.cancelledDate), "short"),
            })
          }}
        </template>
      </span>
    </div>

    <VcIcon name="chevron-right" size="sm" class="subscription-row__chevron" />
  </router-link>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { SUBSCRIPTION_DETAILS_ROUTE_NAME } from "../constants";
import { discountLabel, intervalLabel } from "../utils";
import SubscriptionStatusBadge from "./subscription-status-badge.vue";
import type { ProductSubscriptionFieldsFragment } from "../api/graphql/types";

interface IProps {
  subscription: ProductSubscriptionFieldsFragment;
}

const props = defineProps<IProps>();
const { t } = useI18n();

const savings = computed(() =>
  discountLabel(t, props.subscription.discountType, props.subscription.discountValue, props.subscription.currency),
);
</script>

<style lang="scss">
.subscription-row {
  @apply flex items-center gap-3 px-3 py-4 transition-colors;

  @media (width >= theme("screens.md")) {
    @apply px-5;
  }

  &:hover,
  &:focus-visible {
    @apply bg-neutral-50;
  }

  &__thumb {
    @apply flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-[--vc-radius] border border-neutral-100 bg-additional-50;
  }

  &__image {
    @apply max-h-full max-w-full;
  }

  &__main {
    @apply min-w-0 grow;
  }

  &__title {
    @apply line-clamp-2 text-sm font-bold text-neutral-900;

    @media (width >= theme("screens.md")) {
      @apply text-base;
    }
  }

  &__meta {
    @apply mt-1 flex flex-wrap gap-x-1 text-xs text-neutral-600;

    @media (width >= theme("screens.md")) {
      @apply text-sm;
    }
  }

  &__side {
    @apply flex shrink-0 flex-col items-end gap-1 text-end;
  }

  &__next {
    @apply text-xs text-neutral-600;
  }

  &__chevron {
    --vc-icon-color: var(--color-neutral-400);

    @apply shrink-0;

    @media (width < theme("screens.sm")) {
      @apply hidden;
    }
  }
}
</style>
