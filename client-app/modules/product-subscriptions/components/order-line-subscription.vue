<template>
  <!-- The cart line's subscription row, read-only: no Change, no next-delivery note; the number leads to it. -->
  <SubscriptionSummary
    v-if="subscription"
    class="order-line-subscription"
    :label="label"
    :number="subscription.number"
    :number-to="{ name: SUBSCRIPTIONS_ROUTE_NAME, query: { subscription: subscription.id } }"
    :number-test-id="`order-line-subscription-link-${lineItem.id}`"
    :class="{ 'order-line-subscription--configured': lineItem.configurationItems?.length }"
    :data-test-id="`order-line-subscription-${lineItem.id}`"
  />
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useOrderSubscriptions } from "../composables/useOrderSubscriptions";
import { SUBSCRIPTIONS_ROUTE_NAME } from "../constants";
import { intervalLabel } from "../utils";
import SubscriptionSummary from "./subscription-summary.vue";
import type { PreparedLineItemType } from "@/core/types";

interface IProps {
  lineItem: PreparedLineItemType;
  orderId: string;
}

const props = defineProps<IProps>();

const { t } = useI18n();
const { ensure, subscriptionFor } = useOrderSubscriptions();

const subscription = subscriptionFor(
  () => props.orderId,
  () => props.lineItem.productId,
);
const label = computed(() =>
  subscription.value ? intervalLabel(t, subscription.value.intervalUnit, subscription.value.intervalCount) : "",
);

onMounted(() => {
  void ensure(props.orderId);
});
</script>

<style lang="scss">
.order-line-subscription {
  @apply mt-3;

  // The order's components list follows right below: keep them apart.
  &--configured {
    @apply mb-3;
  }
}
</style>
