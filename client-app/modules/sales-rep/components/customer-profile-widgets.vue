<template>
  <div class="customer-profile-widgets">
    <div
      v-for="card in cards"
      :key="card.key"
      class="customer-profile-widgets__card"
      :class="`customer-profile-widgets__card--${card.accent}`"
    >
      <div class="customer-profile-widgets__head">
        <VcIcon class="customer-profile-widgets__icon" :name="card.icon" size="sm" />

        <span class="customer-profile-widgets__label">{{ t(card.labelKey) }}</span>
      </div>

      <div class="customer-profile-widgets__value">{{ card.value }}</div>

      <div class="customer-profile-widgets__sub">{{ card.sub }}</div>

      <div class="customer-profile-widgets__delta" :class="`customer-profile-widgets__delta--${card.deltaTone}`">
        <VcIcon :name="card.deltaIcon" size="xs" />

        <span>{{ card.delta }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

// Every profile block takes `organizationId` (uniform contract with the other blocks). Unused
// until the stats query is wired.
defineProps<{ organizationId: string }>();

const { t } = useI18n();

// MOCK DATA — VCST-5308 ships the visual; real figures land in VCST-5309 once
// `salesRepCustomerOrderStatistics(id, storeId, currencyCode)` and the "current/last year"
// date-range semantics are finalized. Then `value`/`sub`/`delta` come from the query (with
// `$n`/`$d` formatting) and `deltaTone` from the YoY sign.
type WidgetToneType = "positive" | "negative";
type WidgetAccentType = "success" | "warning" | "secondary" | "primary";
type WidgetCardType = {
  key: string;
  labelKey: string;
  icon: string;
  accent: WidgetAccentType;
  value: string;
  sub: string;
  delta: string;
  deltaTone: WidgetToneType;
  deltaIcon: string;
};

const cards: WidgetCardType[] = [
  {
    key: "ytd",
    labelKey: "sales_rep.customer_profile.widgets.ytd_purchases",
    icon: "chart-square-bar",
    accent: "success",
    value: "$72,165",
    sub: "vs $64,420 last year",
    delta: "12% YoY",
    deltaTone: "positive",
    deltaIcon: "arrow-up",
  },
  {
    key: "open_balance",
    labelKey: "sales_rep.customer_profile.widgets.open_balance",
    icon: "credit-card",
    accent: "warning",
    value: "$1,200",
    sub: "1 invoice past due",
    delta: "Follow up needed",
    deltaTone: "negative",
    deltaIcon: "arrow-down",
  },
  {
    key: "aov",
    labelKey: "sales_rep.customer_profile.widgets.avg_order_value",
    icon: "presentation-chart-bar",
    accent: "secondary",
    value: "$5,551",
    sub: "across 13 orders YTD",
    delta: "Lifetime $355,613",
    deltaTone: "positive",
    deltaIcon: "arrow-up",
  },
  {
    key: "orders_ytd",
    labelKey: "sales_rep.customer_profile.widgets.orders_ytd",
    icon: "lock-closed",
    accent: "primary",
    value: "13",
    sub: "last order Apr 21, 2026",
    delta: "Customer since 2014",
    deltaTone: "positive",
    deltaIcon: "arrow-up",
  },
];
</script>

<style lang="scss">
// `@apply` keeps the module self-contained as an MF remote (no global utility layer).
.customer-profile-widgets {
  @apply grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4;

  &__card {
    @apply flex flex-col rounded-lg border border-l-4 border-neutral-200 bg-additional-50 p-5 shadow-sm;

    &--success {
      @apply border-l-success;

      .customer-profile-widgets__icon {
        @apply text-success;
      }
    }

    &--warning {
      @apply border-l-warning;

      .customer-profile-widgets__icon {
        @apply text-warning;
      }
    }

    &--secondary {
      @apply border-l-secondary;

      .customer-profile-widgets__icon {
        @apply text-secondary;
      }
    }

    &--primary {
      @apply border-l-primary;

      .customer-profile-widgets__icon {
        @apply text-primary;
      }
    }
  }

  &__head {
    @apply flex items-center gap-2;
  }

  &__label {
    @apply text-xs font-semibold uppercase tracking-wide text-neutral-500;
  }

  &__value {
    @apply mt-2 text-3xl font-bold leading-tight text-neutral-900;
  }

  &__sub {
    @apply mt-1 text-xs text-neutral-500;
  }

  &__delta {
    @apply mt-3 flex items-center gap-1 text-xs font-medium;

    &--positive {
      @apply text-success-600;
    }

    &--negative {
      @apply text-danger-600;
    }
  }
}
</style>
