<template>
  <VcWidget
    size="lg"
    class="subscription-delivery"
    :class="{ 'subscription-delivery--attention': isAttention }"
    :data-test-id="`subscription-delivery-${renewal.number}`"
  >
    <template #prepend>
      <!-- The widget's own hexagon (size and colours from the theme); a delivery that needs action is tinted. -->
      <VcShape class="subscription-delivery__shape" icon="truck" :bg-color="isAttention ? issueColor : undefined" />
    </template>

    <template #title>
      <span class="subscription-delivery__title">
        <span>{{ $d(scheduledDate, "short") }}</span>

        <span class="subscription-delivery__when">{{ relativeDay }}</span>

        <VcBadge v-if="isNext" color="secondary" variant="soft" size="sm" rounded>
          {{ $t("product_subscriptions.deliveries.next_badge") }}
        </VcBadge>
      </span>
    </template>

    <template #append>
      <span class="subscription-delivery__actions">
        <span v-if="total?.formattedAmount" class="subscription-delivery__summary">
          {{ $t("product_subscriptions.deliveries.items", { count: itemCount }, itemCount) }} ·

          <strong><VcPriceDisplay :value="total" /></strong>
        </span>

        <VcButton
          v-if="renewal.canSkip"
          size="xs"
          variant="outline"
          color="secondary"
          prepend-icon="fast-forward"
          :loading="busy === 'skip'"
          :disabled="!!busy"
          data-test-id="subscription-delivery-skip-button"
          @click="emitAction('skip')"
        >
          {{ $t("product_subscriptions.deliveries.skip") }}
        </VcButton>

        <SubscriptionItemMenu
          :subscriptions="subscriptions"
          :disabled="!!busy"
          :test-id="`subscription-settings-${renewal.number}`"
          @pause="$emit('pause', $event)"
          @cancel="$emit('cancel', $event)"
        />
      </span>
    </template>

    <div class="subscription-delivery__body">
      <VcAlert
        v-if="isAttention"
        :color="issueColor"
        variant="soft"
        size="sm"
        icon
        :title="issueTitle"
        data-test-id="subscription-delivery-issue"
      >
        <div class="subscription-delivery__issue">
          <span>{{ issueText }}</span>

          <VcButton
            v-if="renewal.requiresPaymentAction && renewal.orderId"
            size="xs"
            :color="issueColor"
            :to="{
              name: 'OrderPayment',
              params: { orderId: renewal.orderId },
              query: renewal.storedPaymentMethodId ? { card: renewal.storedPaymentMethodId } : undefined,
            }"
          >
            {{ $t("product_subscriptions.renewal.confirm_payment") }}
          </VcButton>

          <VcButton
            v-else-if="renewal.canRetryPayment"
            size="xs"
            :color="issueColor"
            :loading="busy === 'retry'"
            :disabled="!!busy"
            data-test-id="subscription-delivery-retry-button"
            @click="emitAction('retry')"
          >
            {{ $t("product_subscriptions.renewal.retry") }}
          </VcButton>

          <VcButton
            v-else-if="renewal.canAcceptReview"
            size="xs"
            :color="issueColor"
            :loading="busy === 'accept'"
            :disabled="!!busy"
            data-test-id="subscription-delivery-accept-button"
            @click="emitAction('accept')"
          >
            {{ $t("product_subscriptions.renewal.accept") }}
          </VcButton>
        </div>
      </VcAlert>

      <VcLineItems :items="lines" with-image with-price with-total>
        <template #titles>
          <div class="subscription-delivery__quantity-title">{{ $t("product_subscriptions.deliveries.quantity") }}</div>
        </template>

        <template #after-title="{ item }">
          <template v-if="subscriptionOf(item.id)">
            <span :id="subscriptionAnchorId(item.id)" class="subscription-delivery__number">
              {{ $t("product_subscriptions.common.subscription_number", { number: subscriptionOf(item.id)?.number }) }}
            </span>

            <div class="subscription-delivery__frequency">
              <VcIcon class="subscription-delivery__frequency-icon" name="calendar-check" size="sm" />

              <span class="subscription-delivery__frequency-text">{{ frequencyOf(item.id) }}</span>

              <VcButton
                v-if="subscriptionOf(item.id)?.canChange"
                color="secondary"
                variant="ghost"
                size="xs"
                :disabled="!!busySubscriptions[item.id]"
                :data-test-id="`subscription-frequency-change-${item.id}`"
                @click="onChangeFrequency(item.id, $event)"
              >
                {{ $t("product_subscriptions.deliveries.change") }}
              </VcButton>
            </div>
          </template>
        </template>

        <template #default="{ item }">
          <VcAddToCart hide-button :model-value="item.quantity" :name="item.id" disabled />
        </template>
      </VcLineItems>
    </div>

    <template #footer>
      <div class="subscription-delivery__footer">
        <span class="subscription-delivery__notes">
          <span class="subscription-delivery__hint">{{ hint }}</span>

          <span class="subscription-delivery__estimate">{{
            $t("product_subscriptions.deliveries.prices_estimate")
          }}</span>
        </span>

        <span v-if="total?.formattedAmount" class="subscription-delivery__total">
          {{ $t("product_subscriptions.deliveries.estimated_total") }}

          <strong><VcPriceDisplay :value="total" /></strong>
        </span>
      </div>
    </template>
  </VcWidget>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { getProductRoute } from "@/core/utilities";
import { useRenewalReasons } from "../composables/useRenewalReasons";
import { useSubscriptionOffers } from "../composables/useSubscriptionOffers";
import { ATTENTION_RENEWAL_STATES, UPCOMING_DELIVERY_STATE } from "../constants";
import { intervalLabel, subscriptionAnchorId } from "../utils";
import SubscriptionItemMenu from "./subscription-item-menu.vue";
import type { ProductSubscriptionFieldsFragment, RenewalFieldsFragment } from "../api/graphql/types";
import type { MoneyType } from "@/core/api/graphql/types";
import type { PreparedLineItemType } from "@/core/types";

type RenewalActionType = "accept" | "retry" | "skip";
type SubscriptionType = ProductSubscriptionFieldsFragment;

interface IEmits {
  (event: "renewalAction", value: { action: RenewalActionType; renewal: RenewalFieldsFragment }): void;
  (event: "changeFrequency", subscription: SubscriptionType, trigger?: HTMLElement): void;
  /** All the delivery's subscriptions that can be paused (the settings menu acts on the whole delivery). */
  (event: "pause", subscriptions: SubscriptionType[]): void;
  (event: "cancel", subscriptions: SubscriptionType[]): void;
}

interface IProps {
  renewal: RenewalFieldsFragment;
  subscriptionsById: Record<string, SubscriptionType>;
  isNext?: boolean;
  /** The renewal action in progress. */
  busy?: string;
  /** Subscription id -> the action in progress for it. */
  busySubscriptions?: Record<string, string | undefined>;
}

const emit = defineEmits<IEmits>();
const props = withDefaults(defineProps<IProps>(), {
  busySubscriptions: () => ({}),
});

const ORDERED_STATES: ReadonlySet<string> = new Set(["Ordered", "Authorized"]);
const DAY_MS = 24 * 60 * 60 * 1000;
/** Half a cent: two prices closer than this are the same price. */
const PRICE_TOLERANCE = 0.005;

const { t, d } = useI18n();
const { reviewReasonText, errorText } = useRenewalReasons();
const { offerFor } = useSubscriptionOffers();

const scheduledDate = computed(() => new Date(props.renewal.scheduledDate));
const isAttention = computed(() => ATTENTION_RENEWAL_STATES.has(props.renewal.state));

const subscriptions = computed(() =>
  props.renewal.items.map((x) => props.subscriptionsById[x.subscriptionId]).filter((x): x is SubscriptionType => !!x),
);

const itemCount = computed(() => props.renewal.items.filter((x) => !x.isExcluded).length);
const total = computed(() => props.renewal.orderTotalMoney ?? props.renewal.previewTotalMoney);

const relativeDay = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = new Date(scheduledDate.value);
  day.setHours(0, 0, 0, 0);
  const days = Math.round((day.getTime() - today.getTime()) / DAY_MS);

  if (days === 0) {
    return t("product_subscriptions.deliveries.today");
  }
  if (days === 1) {
    return t("product_subscriptions.deliveries.tomorrow");
  }
  return days > 0
    ? t("product_subscriptions.deliveries.in_days", { count: days }, days)
    : t("product_subscriptions.deliveries.days_ago", { count: -days }, -days);
});

// What the alert of a delivery that needs the customer says (shown only for those deliveries).
const issueColor = computed<VcAlertColorType>(() =>
  props.renewal.state === "Failed" || props.renewal.state === "RetryScheduled" ? "danger" : "warning",
);
const issueTitle = computed(() => t(`product_subscriptions.statuses.${props.renewal.state}`));
const issueText = computed(() =>
  props.renewal.state === "ReviewRequired"
    ? reviewReasonText(props.renewal)
    : (errorText(props.renewal.lastErrorCode) ?? t("product_subscriptions.renewal.messages.action")),
);

const hint = computed(() => {
  if (isAttention.value) {
    return t("product_subscriptions.deliveries.needs_action");
  }
  if (ORDERED_STATES.has(props.renewal.state)) {
    return t("product_subscriptions.deliveries.ordered_hint");
  }
  if (props.renewal.state === UPCOMING_DELIVERY_STATE) {
    return t("product_subscriptions.deliveries.upcoming_hint");
  }
  const cutoff = props.renewal.cutoffDate ? new Date(props.renewal.cutoffDate) : undefined;
  return cutoff && cutoff.getTime() > Date.now()
    ? t("product_subscriptions.deliveries.cutoff", { date: d(cutoff, "short") })
    : t("product_subscriptions.deliveries.cutoff_passed");
});

const lines = computed<PreparedLineItemType[]>(() =>
  props.renewal.items.map((item) => {
    // Price per item: the product's current catalog price (its subscription offer). The renewal has its own unit
    // price only as a number; when it differs (a price change to review) the catalog price would not add up to the
    // line total, so none is shown. TODO(VCST-6865): the renewal item's own unit price as money once the backend sends it.
    const catalog = offerFor(item.productId)?.price;
    const unitPrice =
      catalog && Math.abs(catalog.amount - item.listPrice) < PRICE_TOLERANCE ? (catalog as MoneyType) : undefined;
    return {
      id: item.subscriptionId,
      name: item.productName ?? "",
      imageUrl: item.imageUrl ?? undefined,
      route: getProductRoute(item.productId),
      productId: item.productId,
      sku: item.sku ?? undefined,
      quantity: item.quantity,
      listPrice: unitPrice,
      actualPrice: unitPrice,
      extendedPrice: item.totalMoney as MoneyType | undefined,
    };
  }),
);

function subscriptionOf(id: string): SubscriptionType | undefined {
  return props.subscriptionsById[id];
}

function frequencyOf(id: string): string {
  const subscription = subscriptionOf(id);
  return subscription ? intervalLabel(t, subscription.intervalUnit, subscription.intervalCount) : "";
}

function emitAction(action: RenewalActionType): void {
  emit("renewalAction", { action, renewal: props.renewal });
}

function onChangeFrequency(id: string, event: MouseEvent): void {
  const subscription = subscriptionOf(id);
  if (subscription) {
    emit("changeFrequency", subscription, event.currentTarget as HTMLElement);
  }
}
</script>

<style lang="scss">
.subscription-delivery {
  &__shape {
    @apply shrink-0;
  }

  &__title {
    @apply flex flex-wrap items-center gap-x-2.5 gap-y-1;
  }

  &__when {
    @apply text-sm font-normal normal-case text-neutral-600;
  }

  &__actions {
    @apply flex flex-wrap items-center justify-end gap-x-3 gap-y-2;
  }

  // On a phone the widget header (shape, date, total and buttons) doesn't fit one row: the date was squeezed onto
  // three lines under the total. The header wraps, and the total and buttons take their own full-width row.
  @media (width < theme("screens.sm")) {
    .vc-widget__header {
      @apply flex-wrap gap-y-2;
    }

    // The date stays beside the shape: sized from zero, it wraps inside itself instead of dropping below the shape.
    .vc-widget__title {
      @apply basis-0;
    }

    .vc-widget__header > .vc-widget__prepend-append:last-child {
      @apply w-full;
    }

    .subscription-delivery__actions {
      @apply w-full;
    }

    .subscription-delivery__summary {
      @apply me-auto;
    }
  }

  &__summary {
    @apply whitespace-nowrap text-sm text-neutral-700;
  }

  &__body {
    @apply flex flex-col gap-3;
  }

  &__issue {
    @apply flex flex-wrap items-center justify-between gap-2;
  }

  &__quantity-title {
    @apply text-center;
  }

  &__number {
    @apply mt-1 block text-xs text-neutral-600;
  }

  &__frequency {
    @apply mt-3 flex flex-wrap items-center gap-x-3 gap-y-1;
  }

  &__frequency-icon {
    --vc-icon-color: var(--color-neutral-700);
  }

  &__frequency-text {
    @apply text-sm text-neutral-900;
  }

  &__footer {
    @apply flex flex-wrap items-center justify-between gap-x-4 gap-y-2;
  }

  &__notes {
    @apply flex flex-col gap-0.5;
  }

  &__hint {
    @apply text-sm text-neutral-600;
  }

  // Same text style as the hint above it.
  &__estimate {
    @apply text-sm text-neutral-600;
  }

  &__total {
    @apply flex items-baseline gap-2 text-sm text-neutral-700;
  }
}
</style>
