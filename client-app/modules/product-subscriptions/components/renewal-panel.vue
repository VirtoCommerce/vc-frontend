<template>
  <div class="renewal-panel" :class="`renewal-panel--${tone}`" :data-test-id="`renewal-${renewal.number}`">
    <div class="renewal-panel__header">
      <div class="renewal-panel__date">
        <VcIcon name="calendar" size="sm" />

        <span>{{ $d(new Date(renewal.scheduledDate), "short") }}</span>
      </div>

      <SubscriptionStatusBadge :status="renewal.state" />
    </div>

    <p class="renewal-panel__message">{{ message }}</p>

    <VcAlert
      v-if="renewal.reviewReason && renewal.canAcceptReview"
      color="warning"
      size="sm"
      variant="soft"
      icon
      class="mb-3"
    >
      {{ renewal.reviewReason }}
    </VcAlert>

    <VcAlert
      v-else-if="renewal.lastErrorMessage && isProblem"
      color="danger"
      size="sm"
      variant="soft"
      icon
      class="mb-3"
    >
      {{ renewal.lastErrorMessage }}
    </VcAlert>

    <ul class="renewal-panel__items">
      <li
        v-for="item in renewal.items"
        :key="item.subscriptionId"
        :class="{ 'renewal-panel__item--excluded': item.isExcluded || !item.isAvailable }"
      >
        <VcImage :src="item.imageUrl" :alt="item.productName ?? ''" class="renewal-panel__image" lazy />

        <span class="renewal-panel__item-name">
          {{ item.productName }}
          <span class="text-neutral-500">× {{ item.quantity }}</span>

          <span v-if="!item.isAvailable && !item.isExcluded" class="renewal-panel__item-warning">{{
            item.message
          }}</span>

          <span v-if="item.isExcluded" class="renewal-panel__item-warning">{{
            $t("product_subscriptions.renewal.excluded")
          }}</span>
        </span>

        <span v-if="item.total" class="renewal-panel__item-total">{{ formatMoney(item.total, renewal.currency) }}</span>
      </li>
    </ul>

    <div class="renewal-panel__footer">
      <div v-if="total" class="renewal-panel__total">
        <span>{{ $t("product_subscriptions.renewal.total") }}</span>

        <strong>{{ formatMoney(total, renewal.currency) }}</strong>
      </div>

      <div class="renewal-panel__actions">
        <VcButton
          v-if="renewal.requiresPaymentAction && renewal.orderId"
          size="sm"
          :to="{ name: 'OrderPayment', params: { orderId: renewal.orderId } }"
          data-test-id="renewal-confirm-payment"
        >
          {{ $t("product_subscriptions.renewal.confirm_payment") }}
        </VcButton>

        <VcButton
          v-if="renewal.canAcceptReview"
          size="sm"
          :loading="busy === 'accept'"
          data-test-id="renewal-accept"
          @click="emitAction('accept')"
        >
          {{ $t("product_subscriptions.renewal.accept") }}
        </VcButton>

        <VcButton
          v-if="renewal.canRetryPayment && !renewal.requiresPaymentAction"
          size="sm"
          :loading="busy === 'retry'"
          data-test-id="renewal-retry"
          @click="emitAction('retry')"
        >
          {{ $t("product_subscriptions.renewal.retry") }}
        </VcButton>

        <VcButton
          v-if="renewal.canSkip"
          size="sm"
          variant="outline"
          :loading="busy === 'skip'"
          data-test-id="renewal-skip"
          @click="emitAction('skip')"
        >
          {{ $t("product_subscriptions.renewal.skip") }}
        </VcButton>

        <VcButton
          v-if="renewal.orderId"
          size="sm"
          variant="ghost"
          :to="{ name: 'OrderDetails', params: { orderId: renewal.orderId } }"
        >
          {{ $t("product_subscriptions.renewal.view_order", { number: renewal.orderNumber }) }}
        </VcButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { formatMoney } from "../utils";
import SubscriptionStatusBadge from "./subscription-status-badge.vue";
import type { RenewalFieldsFragment } from "../api/graphql/types";

interface IProps {
  renewal: RenewalFieldsFragment;
  busy?: string;
}

interface IEmits {
  (event: "action", value: { action: "accept" | "retry" | "skip"; renewal: RenewalFieldsFragment }): void;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();
const { t, d } = useI18n();

const isProblem = computed(() => ["Failed", "RetryScheduled", "PaymentActionRequired"].includes(props.renewal.state));
const total = computed(() => props.renewal.orderTotal ?? props.renewal.notifiedTotal ?? props.renewal.previewTotal);

const tone = computed(() => {
  if (["ReviewRequired", "PaymentActionRequired", "RetryScheduled"].includes(props.renewal.state)) {
    return "warning";
  }

  return props.renewal.state === "Failed" ? "danger" : "default";
});

const message = computed(() => {
  const r = props.renewal;
  switch (r.state) {
    case "Scheduled":
    case "Notified":
      return t("product_subscriptions.renewal.messages.notified", { cutoff: d(new Date(r.cutoffDate), "long") });
    case "ReviewRequired":
      return t("product_subscriptions.renewal.messages.review");
    case "Ordered":
      return t("product_subscriptions.renewal.messages.ordered");
    case "PaymentActionRequired":
      return t("product_subscriptions.renewal.messages.action");
    case "RetryScheduled":
      return r.nextAttemptDate
        ? t("product_subscriptions.renewal.messages.retry", { date: d(new Date(r.nextAttemptDate), "long") })
        : t("product_subscriptions.renewal.messages.retry_soon");
    case "Authorized":
      return t("product_subscriptions.renewal.messages.authorized");
    case "Completed":
      return t("product_subscriptions.renewal.messages.completed");
    case "Failed":
      return t("product_subscriptions.renewal.messages.failed");
    case "Skipped":
      return t("product_subscriptions.renewal.messages.skipped");
    default:
      return t("product_subscriptions.renewal.messages.cancelled");
  }
});

function emitAction(action: "accept" | "retry" | "skip") {
  emit("action", { action, renewal: props.renewal });
}
</script>

<style lang="scss">
.renewal-panel {
  @apply rounded-lg border border-neutral-200 bg-additional-50 p-4;

  &--warning {
    @apply border-warning-300 bg-warning-50;
  }

  &--danger {
    @apply border-danger-300 bg-danger-50;
  }

  &__header {
    @apply mb-1 flex items-center justify-between gap-2;
  }

  &__date {
    @apply flex items-center gap-2 text-base font-bold text-neutral-900;
  }

  &__message {
    @apply mb-3 text-sm text-neutral-700;
  }

  &__items {
    @apply mb-3 flex flex-col gap-2;

    li {
      @apply flex items-center gap-3 text-sm;
    }
  }

  &__item--excluded {
    @apply opacity-60;
  }

  &__image {
    @apply size-10 shrink-0 rounded border border-neutral-100 bg-additional-50 object-contain;
  }

  &__item-name {
    @apply flex min-w-0 grow flex-col;
  }

  &__item-warning {
    @apply text-xs text-danger;
  }

  &__item-total {
    @apply shrink-0 font-bold;
  }

  &__footer {
    @apply flex flex-col gap-3 border-t border-neutral-200 pt-3 sm:flex-row sm:items-center sm:justify-between;
  }

  &__total {
    @apply flex items-center gap-2 text-sm;
  }

  &__actions {
    @apply flex flex-wrap gap-2;
  }
}
</style>
