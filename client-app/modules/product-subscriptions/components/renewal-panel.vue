<template>
  <div class="renewal-panel" :class="tone && `renewal-panel--${tone}`" :data-test-id="`renewal-${renewal.number}`">
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
      class="renewal-panel__alert"
    >
      {{ renewal.reviewReason }}
    </VcAlert>

    <VcAlert
      v-else-if="renewal.lastErrorMessage && renewal.state === 'Failed'"
      color="danger"
      size="sm"
      variant="soft"
      icon
      class="renewal-panel__alert"
    >
      {{ renewal.lastErrorMessage }}
    </VcAlert>

    <ul class="renewal-panel__items">
      <RenewalItem v-for="item in renewal.items" :key="item.subscriptionId" :item="item" :currency="renewal.currency" />
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
          :to="{
            name: 'OrderPayment',
            params: { orderId: renewal.orderId },
            query: renewal.storedPaymentMethodId ? { card: renewal.storedPaymentMethodId } : undefined,
          }"
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
import RenewalItem from "./renewal-item.vue";
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

const total = computed(() => props.renewal.orderTotal ?? props.renewal.notifiedTotal ?? props.renewal.previewTotal);

const tone = computed<"warning" | "danger" | undefined>(() => {
  if (["ReviewRequired", "PaymentActionRequired", "RetryScheduled"].includes(props.renewal.state)) {
    return "warning";
  }

  return props.renewal.state === "Failed" ? "danger" : undefined;
});

const message = computed(() => {
  const r = props.renewal;
  switch (r.state) {
    case "Scheduled":
    case "Notified":
      return t("product_subscriptions.renewal.messages.notified", {
        cutoff: d(new Date(r.cutoffDate), {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
      });
    case "ReviewRequired":
      return t("product_subscriptions.renewal.messages.review");
    case "Ordered":
      return t("product_subscriptions.renewal.messages.ordered");
    case "PaymentActionRequired":
      // The renewal says why: 3-D Secure, or no card on file to charge.
      return r.lastErrorMessage || t("product_subscriptions.renewal.messages.action");
    case "RetryScheduled":
      return r.nextAttemptDate
        ? t("product_subscriptions.renewal.messages.retry", { date: d(new Date(r.nextAttemptDate), "short") })
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
  --border-color: var(--color-neutral-200);
  --bg-color: var(--color-additional-50);

  @apply rounded-[--vc-radius] border border-[--border-color] bg-[--bg-color] p-4;

  &--warning {
    --border-color: var(--color-warning-300);
    --bg-color: var(--color-warning-50);
  }

  &--danger {
    --border-color: var(--color-danger-300);
    --bg-color: var(--color-danger-50);
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

  &__alert {
    @apply mb-3;
  }

  &__items {
    @apply mb-3 flex flex-col gap-2;
  }

  &__footer {
    @apply flex flex-col gap-3 border-t border-neutral-200 pt-3;

    @media (width >= theme("screens.sm")) {
      @apply flex-row items-center justify-between;
    }
  }

  &__total {
    @apply flex items-center gap-2 text-sm;
  }

  &__actions {
    @apply flex flex-wrap gap-2;
  }
}
</style>
