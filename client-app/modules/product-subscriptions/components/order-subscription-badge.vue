<template>
  <!-- In Order history: the order was placed by a subscription on its delivery date, not by the customer. -->
  <VcBadge
    v-if="renewal"
    class="order-subscription-badge"
    color="info"
    variant="soft"
    size="sm"
    rounded
    nowrap
    :title="$t('product_subscriptions.order.automatic', { date: $d(renewal.scheduledDate) })"
    :data-test-id="`order-subscription-badge-${order.id}`"
  >
    {{ $t("product_subscriptions.order.badge") }}
  </VcBadge>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useOrderSubscriptions } from "../composables/useOrderSubscriptions";
import type { CustomerOrderType } from "@/core/api/graphql/types";

interface IProps {
  order: CustomerOrderType;
}

const props = defineProps<IProps>();

const { ensure, renewalFor } = useOrderSubscriptions();

const renewal = renewalFor(() => props.order.id);

onMounted(() => {
  void ensure(props.order.id);
});
</script>
