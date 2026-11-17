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
import { usePageHead } from "@/core/composables";
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
  pauseProductSubscription,
  resumeProductSubscription,
  retrySubscriptionRenewalPayment,
  skipSubscriptionRenewal,
} from "../api/graphql";
import PurchaseOptionsModal from "../components/purchase-options-modal.vue";
import SubscriptionConfirmModal from "../components/subscription-confirm-modal.vue";
import SubscriptionDelivery from "../components/subscription-delivery.vue";
import { useSubscriptionOffers } from "../composables/useSubscriptionOffers";
import { ATTENTION_RENEWAL_STATES } from "../constants";
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

const { t, d } = useI18n();
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

const deliveries = computed(() => {
  const orderedSince = Date.now() - ORDERED_SHOWN_DAYS * DAY_MS;
  return renewals.value
    .filter((x) => ATTENTION_RENEWAL_STATES.has(x.state) || UPCOMING_STATES.has(x.state))
    .filter((x) => CHANGEABLE_STATES.has(x.state) || new Date(x.scheduledDate).getTime() >= orderedSince)
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
});
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
    const merged = [...openRenewals, ...failed];
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

function changeFrequency(subscription: SubscriptionType, triggerElement?: HTMLElement): void {
  const offer = offerFor(subscription.productId);
  if (!offer) {
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
    task: () => skipSubscriptionRenewal({ renewalId: renewal.id }),
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

  &__inactive-number {
    @apply basis-full text-xs;
  }

  &__inactive-meta {
    @apply mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-neutral-600;
  }
}
</style>
