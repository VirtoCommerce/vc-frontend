<template>
  <div v-if="offer && subscription" class="cart-line-subscription">
    <SubscriptionSummary
      class="cart-line-subscription__summary"
      :label="currentLabel"
      :changeable="!readonly"
      :change-test-id="`cart-line-subscription-change-${lineItem.id}`"
      @change="openPurchaseOptions()"
    />

    <VcAlert v-if="nextDelivery" color="info" size="sm" variant="soft" icon>
      {{ $t("product_subscriptions.cart.subscribed_hint", { date: $d(nextDelivery, "short") }) }}
    </VcAlert>
  </div>
</template>

<script setup lang="ts">
import { toRef } from "vue";
import { useCartLineSubscription } from "../composables/useCartLineSubscription";
import SubscriptionSummary from "./subscription-summary.vue";
import type { PreparedLineItemType } from "@/core/types";

interface IProps {
  lineItem: PreparedLineItemType;
  readonly?: boolean;
}

const props = defineProps<IProps>();

const { offer, subscription, currentLabel, nextDelivery, openPurchaseOptions } = useCartLineSubscription(
  toRef(props, "lineItem"),
);
</script>

<style lang="scss">
.cart-line-subscription {
  @apply mt-3 flex flex-col gap-2;
}
</style>
