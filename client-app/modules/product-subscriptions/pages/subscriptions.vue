<template>
  <div class="subscriptions">
    <header class="subscriptions__header">
      <VcTypography tag="h1">{{ $t("product_subscriptions.list.title") }}</VcTypography>

      <p v-if="activeSubscriptions.length && nextDelivery" class="subscriptions__lead">
        {{
          $t("product_subscriptions.deliveries.lead", {
            count: activeSubscriptions.length,
            date: $d(new Date(nextDelivery.scheduledDate), "short"),
          })
        }}

        <template v-if="actionCount">
          ·
          <strong class="subscriptions__need-action">
            {{ $t("product_subscriptions.deliveries.need_action", { count: actionCount }, actionCount) }}
          </strong>
        </template>
      </p>
    </header>

    <VcWidget v-if="loading && !loaded" size="lg">
      <VcLoaderOverlay />
    </VcWidget>

    <VcAlert
      v-else-if="loadFailed"
      color="danger"
      variant="soft"
      icon
      role="alert"
      data-test-id="subscriptions-load-failed"
    >
      {{ $t("product_subscriptions.list.load_failed") }}

      <VcButton size="xs" variant="outline" class="subscriptions__retry" @click="load">
        {{ $t("product_subscriptions.common.retry") }}
      </VcButton>
    </VcAlert>

    <template v-else>
      <VcWidget v-if="!deliveries.length && !inactiveSubscriptions.length" size="lg">
        <VcEmptyView :text="$t('product_subscriptions.deliveries.empty')" icon="truck">
          <template #button>
            <VcButton :to="{ name: 'Catalog' }">{{ $t("product_subscriptions.list.browse") }}</VcButton>
          </template>
        </VcEmptyView>
      </VcWidget>

      <template v-for="(renewal, index) in deliveries" :key="renewal.id">
        <div v-if="startsMonth(index)" class="subscriptions__month">
          <VcTypography tag="h2" variant="h3">{{ monthLabel(renewal.scheduledDate) }}</VcTypography>
        </div>

        <SubscriptionDelivery
          :renewal="renewal"
          :subscriptions-by-id="subscriptionsById"
          :is-next="index === 0"
          :busy="busy[renewal.id]"
          :busy-subscriptions="busy"
          @renewal-action="onRenewalAction"
          @change-frequency="changeFrequency"
          @pause="confirmPause"
          @cancel="confirmCancel"
          @order-now="confirmOrderNow"
          @change-card="changeCard"
        />
      </template>

      <VcWidget
        v-if="inactiveSubscriptions.length"
        class="subscriptions__inactive"
        :title="$t('product_subscriptions.deliveries.idle_title', { count: inactiveSubscriptions.length })"
        collapsible
        :collapsed="!showInactive"
        data-test-id="subscriptions-inactive"
      >
        <VcLineItems :items="inactiveLines" with-image :with-header="false">
          <template #after-title="{ item }">
            <span
              v-if="subscriptionsById[item.id]"
              :id="subscriptionAnchorId(item.id)"
              class="subscriptions__inactive-meta"
            >
              <span class="subscriptions__inactive-number">
                {{
                  $t("product_subscriptions.common.subscription_number", { number: subscriptionsById[item.id].number })
                }}
              </span>

              <VcBadge
                :color="subscriptionsById[item.id].status === 'Paused' ? 'info' : 'neutral'"
                variant="outline"
                size="sm"
                rounded
              >
                {{ inactiveLabel(subscriptionsById[item.id]) }}
              </VcBadge>

              <span>
                {{
                  $t("product_subscriptions.deliveries.qty_every", {
                    quantity: subscriptionsById[item.id].quantity,
                    interval: intervalLabel(
                      $t,
                      subscriptionsById[item.id].intervalUnit,
                      subscriptionsById[item.id].intervalCount,
                    ),
                  })
                }}
              </span>
            </span>
          </template>

          <template #default="{ item }">
            <VcButton
              v-if="subscriptionsById[item.id]?.canResume"
              size="sm"
              variant="outline"
              color="secondary"
              :loading="busy[item.id] === 'resume'"
              :data-test-id="`subscription-resume-${item.id}`"
              @click="resume(subscriptionsById[item.id])"
            >
              {{ $t("product_subscriptions.deliveries.resume") }}
            </VcButton>

            <VcButton
              v-else-if="subscriptionsById[item.id]?.status === 'Cancelled'"
              size="sm"
              variant="outline"
              color="secondary"
              :to="item.route"
            >
              {{ $t("product_subscriptions.deliveries.subscribe_again") }}
            </VcButton>
          </template>
        </VcLineItems>
      </VcWidget>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { useCurrency, usePageHead } from "@/core/composables";
import { DEFAULT_NOTIFICATION_DURATION } from "@/core/constants";
import { getProductRoute, Logger, toLocalDateOnly } from "@/core/utilities";
import { useModal } from "@/shared/modal";
import { useNotifications } from "@/shared/notification";
import {
  acceptSubscriptionRenewal,
  cancelProductSubscription,
  changeProductSubscription,
  getProductSubscriptions,
  getSubscriptionRenewals,
  orderProductSubscriptionNow,
  pauseProductSubscription,
  resumeProductSubscription,
  retrySubscriptionRenewalPayment,
  skipProductSubscription,
  skipSubscriptionRenewal,
} from "../api/graphql";
import PurchaseOptionsModal from "../components/purchase-options-modal.vue";
import SubscriptionCardModal from "../components/subscription-card-modal.vue";
import SubscriptionConfirmModal from "../components/subscription-confirm-modal.vue";
import SubscriptionDelivery from "../components/subscription-delivery.vue";
import { useSubscriptionOffers } from "../composables/useSubscriptionOffers";
import { ATTENTION_RENEWAL_STATES, UPCOMING_DELIVERY_STATE, UPCOMING_ID_PREFIX } from "../constants";
import {
  addInterval,
  fetchAllPages,
  intervalKey,
  intervalLabel,
  parseIntervalKey,
  subscriptionAnchorId,
  subscriptionErrorMessage,
} from "../utils";
import type { ProductSubscriptionFieldsFragment, RenewalFieldsFragment } from "../api/graphql/types";
import type { PreparedLineItemType } from "@/core/types";

type SubscriptionType = ProductSubscriptionFieldsFragment;

const SUBSCRIPTIONS_PAGE_SIZE = 100;
const RENEWALS_PAGE_SIZE = 50;
/** An ordered delivery stays on the page until it ships; an older one is order history (the Orders page). */
const ORDERED_SHOWN_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

// Deliveries the customer can still change, and those already ordered.
const CHANGEABLE_STATES: ReadonlySet<string> = new Set(["Scheduled", "Notified"]);
const UPCOMING_STATES: ReadonlySet<string> = new Set([...CHANGEABLE_STATES, "Ordered", "Authorized"]);
const ACTIVE_STATUSES: ReadonlySet<string> = new Set(["Active", "PendingActivation", "PastDue"]);

const { t, d, n } = useI18n();
const { currentCurrency } = useCurrency();
const route = useRoute();
const notifications = useNotifications();
const { openModal } = useModal();
const { loadOffers, offerFor } = useSubscriptionOffers();

usePageHead({ title: computed(() => t("product_subscriptions.list.title")) });

const loading = ref(false);
const loaded = ref(false);
const loadFailed = ref(false);
const subscriptions = ref<SubscriptionType[]>([]);
const renewals = ref<RenewalFieldsFragment[]>([]);
/** A link from an order (`?subscription=<id>`) opens the page at that subscription. */
const targetSubscriptionId = computed(() =>
  typeof route.query.subscription === "string" ? route.query.subscription : undefined,
);
const showInactive = ref(false);
/** Renewal or subscription id -> the action in progress for it. */
const busy = reactive<Record<string, string | undefined>>({});

const subscriptionsById = computed(() => Object.fromEntries(subscriptions.value.map((x) => [x.id, x])));
const activeSubscriptions = computed(() => subscriptions.value.filter((x) => ACTIVE_STATUSES.has(x.status)));
const inactiveSubscriptions = computed(() => subscriptions.value.filter((x) => !ACTIVE_STATUSES.has(x.status)));

const openDeliveries = computed(() => {
  const orderedSince = Date.now() - ORDERED_SHOWN_DAYS * DAY_MS;
  return renewals.value
    .filter((x) => ATTENTION_RENEWAL_STATES.has(x.state) || UPCOMING_STATES.has(x.state))
    .filter((x) => CHANGEABLE_STATES.has(x.state) || new Date(x.scheduledDate).getTime() >= orderedSince);
});

/**
 * Deliveries the server hasn't prepared yet. A renewal is created only a few days before a delivery, so most active
 * subscriptions have none: each one's next delivery is shown here, the ones due on the same day in one card. A
 * subscription whose next delivery already has its renewal shows in that renewal's card instead.
 */
const upcomingDeliveries = computed<RenewalFieldsFragment[]>(() => {
  const covered = new Set(
    renewals.value.flatMap((renewal) =>
      renewal.items.map((item) => `${item.subscriptionId}|${toLocalDateOnly(new Date(renewal.scheduledDate))}`),
    ),
  );
  // A past-due subscription waits for its failed payment: its renewal card says so, it has no upcoming delivery.
  const inRenewal = new Set(renewals.value.flatMap((renewal) => renewal.items.map((item) => item.subscriptionId)));
  const byDay = new Map<string, SubscriptionType[]>();
  activeSubscriptions.value
    .filter((x) => !(x.status === "PastDue" && inRenewal.has(x.id)))
    .filter((x) => !covered.has(`${x.id}|${toLocalDateOnly(new Date(x.nextOrderDate))}`))
    .forEach((x) => {
      // A past-due subscription gets a card of its own, so its payment problem doesn't mark the others.
      const day = toLocalDateOnly(new Date(x.nextOrderDate)) + (x.status === "PastDue" ? "-past-due" : "");
      byDay.set(day, [...(byDay.get(day) ?? []), x]);
    });
  return [...byDay.entries()].map(([day, items]) => toUpcomingDelivery(day, items));
});

const deliveries = computed(() =>
  [...openDeliveries.value, ...upcomingDeliveries.value].sort(
    (a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime(),
  ),
);

/** The money for an estimate the server hasn't computed: the subscription's currency, formatted like the store's. */
function estimate(amount: number, currency: string | null | undefined) {
  const code = currency || currentCurrency.value.code;
  return { amount, formattedAmount: n(amount, { style: "currency", currency: code }) };
}

/** An upcoming delivery in the shape of a renewal, so the page shows every delivery with the same card. */
function toUpcomingDelivery(day: string, items: SubscriptionType[]): RenewalFieldsFragment {
  const lines = items.map((x) => {
    // The estimate is today's subscription price; the reminder before the delivery has the final one.
    const unit = offerFor(x.productId)?.subscriptionPrice?.amount ?? x.referencePriceMoney?.amount ?? 0;
    return {
      subscriptionId: x.id,
      productId: x.productId,
      sku: x.sku,
      productName: x.productName,
      imageUrl: x.imageUrl,
      quantity: x.quantity,
      listPrice: offerFor(x.productId)?.price?.amount ?? 0,
      discountAmount: 0,
      totalMoney: estimate(unit * x.quantity, x.currency),
      isAvailable: true,
      isExcluded: false,
      message: undefined,
    };
  });
  const total = lines.reduce((sum, x) => sum + x.totalMoney.amount, 0);
  // Past due with no renewal to retry: the payment failed for good, the customer has to update the card.
  const pastDue = items.some((x) => x.status === "PastDue");
  return {
    id: `${UPCOMING_ID_PREFIX}${day}`,
    number: `${UPCOMING_ID_PREFIX}${day}`,
    state: pastDue ? "Failed" : UPCOMING_DELIVERY_STATE,
    lastErrorCode: pastDue ? "RETRIES_EXHAUSTED" : undefined,
    scheduledDate: items[0].nextOrderDate,
    // No reminder has gone out yet, so there is no cut-off date: the hint says changes stay open until the reminder.
    cutoffDate: undefined,
    isManual: false,
    currency: items[0].currency,
    previewTotalMoney: estimate(total, items[0].currency),
    discountTotal: 0,
    shippingTotal: 0,
    taxTotal: 0,
    attemptCount: 0,
    canSkip: items.every((x) => x.canSkip),
    canAcceptReview: false,
    canRetryPayment: false,
    requiresPaymentAction: false,
    items: lines,
  };
}
/** Whether a delivery was built on the page from subscriptions (no renewal on the server yet). */
function isUpcoming(renewal: RenewalFieldsFragment): boolean {
  return renewal.id.startsWith(UPCOMING_ID_PREFIX);
}
const nextDelivery = computed(() => deliveries.value[0]);
const actionCount = computed(() => deliveries.value.filter((x) => ATTENTION_RENEWAL_STATES.has(x.state)).length);

const inactiveLines = computed<PreparedLineItemType[]>(() =>
  inactiveSubscriptions.value.map((x) => ({
    id: x.id,
    name: x.productName ?? "",
    imageUrl: x.imageUrl ?? undefined,
    route: getProductRoute(x.productId),
    productId: x.productId,
    sku: x.sku ?? undefined,
  })),
);

/** Scrolls to the subscription the page was opened for, opening "Paused and cancelled" when it is there. */
async function revealTarget(): Promise<void> {
  const id = targetSubscriptionId.value;
  if (!id) {
    return;
  }
  if (inactiveSubscriptions.value.some((x) => x.id === id)) {
    showInactive.value = true;
  }
  await nextTick();
  document.getElementById(subscriptionAnchorId(id))?.scrollIntoView({ block: "center" });
}

function monthKey(date: string): string {
  return toLocalDateOnly(new Date(date)).slice(0, 7);
}

function startsMonth(index: number): boolean {
  return (
    index === 0 ||
    monthKey(deliveries.value[index].scheduledDate) !== monthKey(deliveries.value[index - 1].scheduledDate)
  );
}

function monthLabel(date: string): string {
  return d(new Date(date), { year: "numeric", month: "long" });
}

function inactiveLabel(subscription: SubscriptionType): string {
  if (subscription.status === "Paused") {
    return subscription.pausedUntil
      ? t("product_subscriptions.deliveries.paused_until", { date: d(new Date(subscription.pausedUntil), "short") })
      : t("product_subscriptions.deliveries.paused");
  }
  return subscription.cancelledDate
    ? t("product_subscriptions.deliveries.cancelled_on", { date: d(new Date(subscription.cancelledDate), "short") })
    : t("product_subscriptions.statuses.Cancelled");
}

function notifySuccess(text: string): void {
  notifications.success({ duration: DEFAULT_NOTIFICATION_DURATION, single: true, text });
}

function notifyError(error: unknown): void {
  notifications.error({
    duration: DEFAULT_NOTIFICATION_DURATION,
    single: true,
    text: subscriptionErrorMessage(error, t),
  });
}

async function load(): Promise<void> {
  loading.value = true;
  loadFailed.value = false;
  try {
    // A fixed sort keeps the renewal pages from overlapping. A failure shows the page's own error, so no toast.
    const options = { suppressErrorNotifications: true };
    const [allSubscriptions, openRenewals, recentRenewals] = await Promise.all([
      fetchAllPages((page) => getProductSubscriptions(page, options), SUBSCRIPTIONS_PAGE_SIZE),
      fetchAllPages(
        (page) => getSubscriptionRenewals({ ...page, onlyOpen: true, sort: "ScheduledDate:asc" }, options),
        RENEWALS_PAGE_SIZE,
      ),
      getSubscriptionRenewals({ first: 10, sort: "ModifiedDate:desc" }, options),
    ]);

    subscriptions.value = allSubscriptions;

    // Open renewals, plus recently failed ones the customer can still fix.
    const failed = (recentRenewals?.items ?? []).filter((x) => x.state === "Failed" && x.canRetryPayment);
    // A subscription waiting for payment (past due) is shown by its failed renewal, which has Retry payment: the
    // recent ones above may not include an older one, so it is loaded for each such subscription.
    const shown = new Set([...openRenewals, ...failed].flatMap((x) => x.items.map((i) => i.subscriptionId)));
    const pastDue = allSubscriptions.filter((x) => x.status === "PastDue" && !shown.has(x.id));
    const pastDueRenewals = await Promise.all(
      pastDue.map((x) =>
        getSubscriptionRenewals({ subscriptionId: x.id, first: 1, sort: "ModifiedDate:desc" }, options).then(
          (page) => page?.items?.[0],
        ),
      ),
    );
    const retryable = pastDueRenewals.filter(
      (x): x is RenewalFieldsFragment => !!x && x.state === "Failed" && x.canRetryPayment,
    );
    const merged = [...openRenewals, ...failed, ...retryable];
    renewals.value = merged.filter((x, i) => merged.findIndex((y) => y.id === x.id) === i);
    loaded.value = true;

    // The "Change" dialog needs each product's offer (its frequencies).
    void loadOffers(allSubscriptions.map((x) => x.productId));
  } catch (e) {
    Logger.error("subscriptions.load", e);
    loadFailed.value = true;
  } finally {
    loading.value = false;
  }
}

/** Runs an action under a busy key, reports it and reloads the page. Returns false on failure. */
async function run(key: string, action: string, task: () => Promise<unknown>, success: string): Promise<boolean> {
  busy[key] = action;
  try {
    await task();
    notifySuccess(success);
    await load();
    return true;
  } catch (e) {
    notifyError(e);
    return false;
  } finally {
    busy[key] = undefined;
  }
}

function onRenewalAction({ action, renewal }: { action: "accept" | "retry" | "skip"; renewal: RenewalFieldsFragment }) {
  const command = { renewalId: renewal.id };
  if (action === "accept") {
    void run(renewal.id, action, () => acceptSubscriptionRenewal(command), t("product_subscriptions.renewal.accepted"));
  } else if (action === "retry") {
    void run(
      renewal.id,
      action,
      () => retrySubscriptionRenewalPayment(command),
      t("product_subscriptions.renewal.retried"),
    );
  } else {
    confirmSkip(renewal);
  }
}

async function changeFrequency(subscription: SubscriptionType, triggerElement?: HTMLElement): Promise<void> {
  // The plans load after the subscriptions: a click that comes first waits for them (the Change link shows busy)
  // instead of doing nothing.
  if (!offerFor(subscription.productId)) {
    busy[subscription.id] = "change";
    try {
      await loadOffers([subscription.productId]);
    } finally {
      busy[subscription.id] = undefined;
    }
  }
  const offer = offerFor(subscription.productId);
  if (!offer) {
    notifyError(new Error(`No subscription plan for product ${subscription.productId}`));
    return;
  }

  openModal({
    component: PurchaseOptionsModal,
    triggerElement,
    props: {
      productName: subscription.productName,
      offer,
      currentKey: intervalKey(subscription.intervalUnit, subscription.intervalCount),
      // This product only; the delivery's settings menu acts on all its products.
      onPause: subscription.canPause ? () => confirmPause([subscription]) : undefined,
      onCancel: subscription.canCancel ? () => confirmCancel([subscription]) : undefined,
      async onSave(key: string | undefined): Promise<void> {
        // "One-time purchase" for a running subscription means ending it: that goes through the cancel confirmation.
        if (!key) {
          confirmCancel([subscription]);
          return;
        }
        const { unit, count } = parseIntervalKey(key);
        await changeProductSubscription({ subscriptionId: subscription.id, intervalUnit: unit, intervalCount: count });
        notifySuccess(t("product_subscriptions.deliveries.updated"));
        await load();
      },
    },
  });
}

/** Asks the customer to confirm a change; OK runs it, reports it and reloads the page, an error stays in the dialog. */
function confirmChange(options: {
  title: string;
  variant?: "danger" | "warning";
  lead?: string;
  products?: string[];
  text?: string;
  task: () => Promise<unknown>;
  success: string;
}): void {
  openModal({
    component: SubscriptionConfirmModal,
    props: {
      title: options.title,
      variant: options.variant ?? "danger",
      lead: options.lead,
      products: options.products,
      text: options.text,
      async onConfirm(): Promise<void> {
        await options.task();
        notifySuccess(options.success);
        await load();
      },
    },
  });
}

/** Skips one delivery after the customer has seen its date, its items and the date of the delivery after it. */
function confirmSkip(renewal: RenewalFieldsFragment): void {
  const date = d(new Date(renewal.scheduledDate), "short");
  const included = renewal.items.filter((x) => !x.isExcluded);
  const products = included.map((x) => x.productName ?? "");
  // Every subscription in a delivery moves on by its own frequency; the earliest of them is the next delivery.
  const following = included
    .map((x) => subscriptionsById.value[x.subscriptionId])
    .filter((x): x is SubscriptionType => !!x)
    .map((x) => addInterval(new Date(renewal.scheduledDate), x.intervalUnit, x.intervalCount).getTime());
  const next = following.length ? d(new Date(Math.min(...following)), "short") : undefined;
  const after = next
    ? t("product_subscriptions.deliveries.skip_after", { next })
    : t("product_subscriptions.deliveries.skip_after_no_next");

  // One product reads as one sentence; several are listed.
  const many = products.length > 1;
  confirmChange({
    variant: "warning",
    title: t("product_subscriptions.deliveries.skip_title"),
    lead: many
      ? t("product_subscriptions.deliveries.skip_lead_many", { date })
      : t("product_subscriptions.deliveries.skip_lead_one", { date, product: products[0] ?? "" }),
    products: many ? products : [],
    text: after,
    // An upcoming delivery has no renewal yet: each subscription skips its own next delivery, the one shown here.
    task: () =>
      isUpcoming(renewal)
        ? Promise.all(
            included
              .map((x) => subscriptionsById.value[x.subscriptionId])
              .filter((x): x is SubscriptionType => !!x)
              .map((x) => skipProductSubscription({ subscriptionId: x.id, expectedNextOrderDate: x.nextOrderDate })),
          )
        : skipSubscriptionRenewal({ renewalId: renewal.id }),
    success: t("product_subscriptions.deliveries.skipped"),
  });
}

/**
 * Pauses subscriptions after a confirmation: all of a delivery's (its settings menu) or one product's (its Change
 * dialog). One product reads as one sentence; several are listed.
 */
function confirmPause(targets: SubscriptionType[]): void {
  const many = targets.length > 1;
  confirmChange({
    title: t("product_subscriptions.deliveries.pause_title"),
    lead: many
      ? t("product_subscriptions.deliveries.pause_lead_many")
      : t("product_subscriptions.deliveries.pause_text", { product: targets[0]?.productName ?? "" }),
    products: many ? targets.map((x) => x.productName ?? "") : [],
    text: many ? t("product_subscriptions.deliveries.pause_after_many") : undefined,
    task: () => Promise.all(targets.map((x) => pauseProductSubscription({ subscriptionId: x.id }))),
    success: t("product_subscriptions.deliveries.paused_done"),
  });
}

/** Cancels subscriptions after a confirmation: all of a delivery's or one product's, as `confirmPause`. */
function confirmCancel(targets: SubscriptionType[]): void {
  const many = targets.length > 1;
  confirmChange({
    title: t("product_subscriptions.deliveries.cancel_title"),
    lead: many
      ? t("product_subscriptions.deliveries.cancel_lead_many")
      : t("product_subscriptions.deliveries.cancel_text", { product: targets[0]?.productName ?? "" }),
    products: many ? targets.map((x) => x.productName ?? "") : [],
    text: many ? t("product_subscriptions.deliveries.cancel_after_many") : undefined,
    task: () => Promise.all(targets.map((x) => cancelProductSubscription({ subscriptionId: x.id }))),
    success: t("product_subscriptions.deliveries.cancelled_done"),
  });
}

/**
 * Orders a delivery's products right away, after a confirmation. Each subscription makes its own order and its schedule
 * restarts from today; the store turns this on in its "Customer actions" settings.
 */
function confirmOrderNow(targets: SubscriptionType[]): void {
  const many = targets.length > 1;
  confirmChange({
    variant: "warning",
    title: t("product_subscriptions.deliveries.order_now_title"),
    lead: many
      ? t("product_subscriptions.deliveries.order_now_lead_many")
      : t("product_subscriptions.deliveries.order_now_lead_one", { product: targets[0]?.productName ?? "" }),
    products: many ? targets.map((x) => x.productName ?? "") : [],
    text: t("product_subscriptions.deliveries.order_now_after"),
    // One at a time: the server locks per customer, so parallel requests would only wait for each other.
    task: async () => {
      for (const target of targets) {
        await orderProductSubscriptionNow({ subscriptionId: target.id });
      }
    },
    success: t("product_subscriptions.deliveries.ordered"),
  });
}

/** Picks another saved card for a delivery's subscriptions; the store turns this on in its "Customer actions" settings. */
function changeCard(targets: SubscriptionType[]): void {
  const cards = new Set(targets.map((x) => x.storedPaymentMethodId ?? ""));
  openModal({
    component: SubscriptionCardModal,
    props: {
      products: targets.map((x) => x.productName ?? ""),
      // Preselect the card only when all the subscriptions share it.
      currentCardId: cards.size === 1 ? (targets[0]?.storedPaymentMethodId ?? undefined) : undefined,
      async onSave(cardId: string): Promise<void> {
        await Promise.all(
          targets
            .filter((x) => x.storedPaymentMethodId !== cardId)
            .map((x) => changeProductSubscription({ subscriptionId: x.id, savedPaymentMethodId: cardId })),
        );
        notifySuccess(t("product_subscriptions.deliveries.card_changed"));
        await load();
      },
    },
  });
}

function resume(subscription: SubscriptionType): void {
  void run(
    subscription.id,
    "resume",
    () => resumeProductSubscription({ subscriptionId: subscription.id }),
    t("product_subscriptions.deliveries.resumed"),
  );
}

onMounted(async () => {
  await load();
  await revealTarget();
});
</script>

<style lang="scss">
.subscriptions {
  @apply flex flex-col gap-5;

  &__lead {
    @apply mt-1 text-sm text-neutral-600;
  }

  &__need-action {
    @apply font-bold text-warning-700;
  }

  &__retry {
    @apply mt-2;
  }

  &__month {
    @apply mt-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1;

    &:first-of-type {
      @apply mt-0;
    }
  }

  // As on the delivery cards: the number, status and frequency sit in the line item's after-title slot, which it
  // hides on a narrow card.
  &__inactive .vc-line-item__name-actions {
    @apply block;
  }

  &__inactive-number {
    @apply basis-full text-xs;
  }

  &__inactive-meta {
    @apply mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-neutral-600;
  }
}
</style>
