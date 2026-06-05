<template>
  <div class="order-card">
    <div class="order-card__grid">
      <!-- Order number -->
      <div class="order-card__cell order-card__cell--number">
        <span class="order-card__label">
          {{ $t("pages.account.orders.order_number_label") }}
        </span>

        <a class="order-card__number" :href="orderHref" :target="linkTarget" :rel="linkRel">
          {{ item.number }}
        </a>
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
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useBrowserTarget } from "@/core/composables";
import { BrowserTargetType } from "@/core/enums";
import OrderStatus from "./order-status.vue";
import type { OrderScopeType } from "../types";
import type { CustomerOrderType } from "@/core/api/graphql/types";

interface IProps {
  item: CustomerOrderType;
  orderScope: OrderScopeType;
}

const props = defineProps<IProps>();

const router = useRouter();
const { browserTarget } = useBrowserTarget();

const orderHref = computed(() => router.resolve({ name: "OrderDetails", params: { orderId: props.item.id } }).href);

const linkTarget = computed(() => {
  return browserTarget.value === BrowserTargetType.BLANK ? "_blank" : undefined;
});

const linkRel = computed(() => {
  return browserTarget.value === BrowserTargetType.BLANK ? "noopener noreferrer" : undefined;
});

const showBuyerName = computed(() => props.orderScope === "organization" && !!props.item?.customerName);

const paymentType = computed(() => props.item.inPayments?.[0]?.paymentMethod?.name);
</script>

<style lang="scss">
.order-card {
  @apply relative w-full cursor-pointer border-b border-neutral-200 px-4 py-3 text-left text-xs transition-shadow;

  // The card is the query container so the grid can adapt to the card's own width.
  container-type: inline-size;

  &:hover {
    @apply shadow-md;
  }

  &:hover &__number {
    color: var(--link-hover-color);
  }

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
    @apply truncate font-bold no-underline transition-colors;

    color: var(--link-color);

    // Stretched link: the whole card is clickable, while the accessible
    // name stays limited to the order number.
    &::after {
      @apply absolute inset-0;

      content: "";
    }
  }

  &__total {
    @apply truncate font-bold;
  }
}
</style>
