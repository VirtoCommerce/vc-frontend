<template>
  <button
    class="order-card"
    type="button"
    tabindex="0"
    @click="$emit('select', item)"
    @keyup.enter="$emit('select', item)"
  >
    <div class="order-card__grid">
      <!-- Order number -->
      <div class="order-card__cell order-card__cell--number">
        <span class="order-card__label">
          {{ $t("pages.account.orders.order_number_label") }}
        </span>

        <span class="order-card__number">
          {{ item.number }}
        </span>
      </div>

      <!-- Date -->
      <div class="order-card__cell order-card__cell--date">
        <span class="order-card__label">
          {{ $t("pages.account.orders.date_label") }}
        </span>

        <span class="order-card__value">
          {{ $d(item?.createdDate) }}
        </span>
      </div>

      <!-- Status chip -->
      <div class="order-card__cell order-card__cell--status">
        <OrderStatus :status="item.status" :display-value="item.statusDisplayValue" />
      </div>

      <!-- Buyer name -->
      <div v-if="showBuyerName" class="order-card__cell order-card__cell--buyer">
        <span class="order-card__label">
          {{ $t("pages.account.orders.buyer_name_label") }}
        </span>

        <span class="order-card__value">
          {{ item.customerName }}
        </span>
      </div>

      <!-- Payment type -->
      <div v-if="paymentType" class="order-card__cell order-card__cell--payment">
        <span class="order-card__label">
          {{ $t("pages.account.orders.payment_type_label") }}
        </span>

        <span class="order-card__value">
          {{ paymentType }}
        </span>
      </div>

      <!-- Total -->
      <div class="order-card__cell order-card__cell--total">
        <span class="order-card__label">
          {{ $t("pages.account.orders.total_label") }}
        </span>

        <span class="order-card__total">
          {{ item.total?.formattedAmount }}
        </span>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import OrderStatus from "./order-status.vue";
import type { OrderScopeType } from "../types";
import type { CustomerOrderType } from "@/core/api/graphql/types";

interface IProps {
  item: CustomerOrderType;
  orderScope: OrderScopeType;
}

interface IEmits {
  (event: "select", item: CustomerOrderType): void;
}

defineEmits<IEmits>();

const props = defineProps<IProps>();

const showBuyerName = computed(() => props.orderScope === "organization" && !!props.item?.customerName);

const paymentType = computed(() => props.item.inPayments?.[0]?.paymentMethod?.name);
</script>

<style lang="scss">
.order-card {
  @apply w-full cursor-pointer border-b border-neutral-200 px-4 py-3 text-left text-xs;

  // The card is the query container so the grid can adapt to the card's own width.
  container-type: inline-size;

  &__grid {
    @apply grid items-start gap-2.5;

    // Full v2 layout: 3 columns, 2 rows.
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr);
    grid-template-areas:
      "number  date    status"
      "buyer   payment total";

    // Compact layout up to the xs breakpoint (480px): two columns, three rows.
    // Left: number / date / buyer. Right: status / payment / total.
    @container (max-width: theme("containers.sm")) {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      grid-template-areas:
        "number  status"
        "date    payment"
        "buyer   total";
    }
  }

  &__cell {
    @apply flex min-w-0 flex-col;

    &--number {
      grid-area: number;
    }

    &--date {
      grid-area: date;
    }

    &--status {
      @apply items-end justify-center;

      grid-area: status;
    }

    &--buyer {
      grid-area: buyer;
    }

    &--payment {
      grid-area: payment;

      @container (max-width: theme("containers.sm")) {
        @apply items-end text-right;
      }
    }

    &--total {
      @apply items-end text-right;

      grid-area: total;
    }
  }

  &__label {
    @apply truncate text-neutral-500;
  }

  &__value {
    @apply truncate;
  }

  &__number {
    @apply truncate font-bold text-accent-500;
  }

  &__total {
    @apply truncate font-bold;
  }
}
</style>
