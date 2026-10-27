<template>
  <VcRecordCard
    class="order-card"
    :title="item.number"
    :to="orderRoute"
    :target="linkTarget"
    :description="$d(item.createdDate)"
    :meta="meta"
  >
    <template #metric>
      <span v-for="total in displayTotals" :key="total.currency.code" class="order-card__total">
        {{ total.formattedAmount }}
      </span>
    </template>

    <template #status>
      <OrderStatus :status="item.status" :display-value="item.statusDisplayValue" />
    </template>
  </VcRecordCard>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useBrowserTarget } from "@/core/composables";
import { BrowserTargetType } from "@/core/enums";
import { getDisplayTotals } from "@/core/utilities";
import { ROUTES } from "@/router/routes/constants";
import OrderStatus from "./order-status.vue";
import type { OrderScopeType } from "../types";
import type { CustomerOrderType } from "@/core/api/graphql/types";

interface IProps {
  item: CustomerOrderType;
  orderScope: OrderScopeType;
}

const props = defineProps<IProps>();

const { browserTarget } = useBrowserTarget();

const orderRoute = computed(() => ({ name: ROUTES.ORDER_DETAILS.NAME, params: { orderId: props.item.id } }));

const linkTarget = computed(() => (browserTarget.value === BrowserTargetType.BLANK ? "_blank" : undefined));

const displayTotals = computed(() => getDisplayTotals(props.item));

const meta = computed<VcRecordCardMetaItemType[]>(() => {
  const items: VcRecordCardMetaItemType[] = [];

  if (props.orderScope === "organization" && props.item.customerName) {
    items.push({ icon: "user", text: props.item.customerName });
  } else if (props.item.purchaseOrderNumber) {
    items.push({ icon: "hash", text: props.item.purchaseOrderNumber });
  }

  const paymentMethod = props.item.inPayments?.[0]?.paymentMethod?.name;

  if (paymentMethod) {
    items.push({ icon: "credit-card", text: paymentMethod });
  }

  return items;
});
</script>

<style lang="scss">
.order-card {
  &__total {
    @apply block;
  }
}
</style>
