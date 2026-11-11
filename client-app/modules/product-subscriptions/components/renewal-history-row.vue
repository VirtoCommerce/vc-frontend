<template>
  <li class="renewal-history-row">
    <span class="renewal-history-row__date">{{ $d(new Date(renewal.scheduledDate), "short") }}</span>

    <SubscriptionStatusBadge :status="renewal.state" />

    <router-link
      v-if="renewal.orderId"
      :to="{ name: 'OrderDetails', params: { orderId: renewal.orderId } }"
      class="renewal-history-row__order"
    >
      {{ renewal.orderNumber }}
    </router-link>

    <span class="renewal-history-row__total">{{
      formatMoney(renewal.orderTotal ?? renewal.previewTotal, renewal.currency)
    }}</span>
  </li>
</template>

<script setup lang="ts">
import { formatMoney } from "../utils";
import SubscriptionStatusBadge from "./subscription-status-badge.vue";
import type { RenewalFieldsFragment } from "../api/graphql/types";

interface IProps {
  renewal: RenewalFieldsFragment;
}

defineProps<IProps>();
</script>

<style lang="scss">
.renewal-history-row {
  @apply flex flex-wrap items-center gap-3 py-3 text-sm;

  &__date {
    @apply font-bold;
  }

  &__order {
    @apply text-[--link-color] hover:text-[--link-hover-color];
  }

  &__total {
    @apply ms-auto font-bold;
  }
}
</style>
