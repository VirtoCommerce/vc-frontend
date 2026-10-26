<template>
  <div class="subscriptions-page">
    <div class="subscriptions-page__header">
      <div>
        <VcTypography tag="h1">{{ $t("product_subscriptions.list.title") }}</VcTypography>

        <p class="subscriptions-page__subtitle">{{ $t("product_subscriptions.list.subtitle") }}</p>
      </div>

      <VcButton variant="outline" size="sm" prepend-icon="credit-card" :to="{ name: ROUTES.PAYMENT_METHODS.NAME }">
        {{ $t("shared.payment.saved_cards.page_title") }}
      </VcButton>
    </div>

    <!-- Deliveries that need the customer -->
    <section v-if="attentionRenewals.length" class="subscriptions-page__section" aria-labelledby="ps-attention">
      <h2 id="ps-attention" class="subscriptions-page__section-title">
        <VcIcon name="exclamation-circle" size="sm" class="text-warning" />
        {{ $t("product_subscriptions.list.needs_attention") }}
      </h2>

      <div class="subscriptions-page__renewals">
        <RenewalPanel
          v-for="renewal in attentionRenewals"
          :key="renewal.id"
          :renewal="renewal"
          :busy="busy[renewal.id]"
          @action="onRenewalAction"
        />
      </div>
    </section>

    <!-- Upcoming deliveries -->
    <section v-if="upcomingRenewals.length" class="subscriptions-page__section" aria-labelledby="ps-upcoming">
      <h2 id="ps-upcoming" class="subscriptions-page__section-title">
        <VcIcon name="truck" size="sm" />
        {{ $t("product_subscriptions.list.upcoming") }}
      </h2>

      <div class="subscriptions-page__renewals">
        <RenewalPanel
          v-for="renewal in upcomingRenewals"
          :key="renewal.id"
          :renewal="renewal"
          :busy="busy[renewal.id]"
          @action="onRenewalAction"
        />
      </div>
    </section>

    <VcWidget size="lg">
      <template #default-container>
        <div class="subscriptions-page__tabs" role="group" :aria-label="$t('product_subscriptions.list.tabs_label')">
          <VcTabSwitch
            v-for="tab in tabs"
            :key="tab.id"
            :model-value="activeTab"
            :value="tab.id"
            name="subscriptions-status"
            size="sm"
            :data-test-id="`subscriptions-tab-${tab.id}`"
            @change="activeTab = tab.id"
          >
            <span class="subscriptions-page__tab-label">
              {{ $t(`product_subscriptions.list.tabs.${tab.id}`) }}
              <span class="subscriptions-page__tab-count">{{ countFor(tab.id) }}</span>
            </span>
          </VcTabSwitch>
        </div>

        <VcLoaderOverlay v-if="loading && !subscriptions.length" />

        <VcEmptyView
          v-else-if="!visibleSubscriptions.length"
          :text="$t(`product_subscriptions.list.empty.${activeTab}`)"
          icon="refresh"
          class="py-10"
        >
          <template v-if="activeTab === 'active'" #button>
            <VcButton :to="{ name: 'Catalog' }">{{ $t("product_subscriptions.list.browse") }}</VcButton>
          </template>
        </VcEmptyView>

        <ul v-else class="subscriptions-page__list">
          <li v-for="subscription in visibleSubscriptions" :key="subscription.id">
            <router-link
              :to="{ name: SUBSCRIPTION_DETAILS_ROUTE_NAME, params: { subscriptionId: subscription.id } }"
              class="subscription-row"
              :data-test-id="`subscription-row-${subscription.number}`"
            >
              <VcImage
                :src="subscription.imageUrl"
                :alt="subscription.productName ?? ''"
                class="subscription-row__image"
                lazy
              />

              <div class="subscription-row__main">
                <div class="subscription-row__title">{{ subscription.productName }}</div>

                <div class="subscription-row__meta">
                  <span>{{ $t("product_subscriptions.common.qty", { quantity: subscription.quantity }) }}</span>

                  <span>· {{ intervalLabel($t, subscription.intervalUnit, subscription.intervalCount) }}</span>

                  <span
                    v-if="
                      discountLabel($t, subscription.discountType, subscription.discountValue, subscription.currency)
                    "
                  >
                    ·
                    {{
                      discountLabel($t, subscription.discountType, subscription.discountValue, subscription.currency)
                    }}
                  </span>
                </div>
              </div>

              <div class="subscription-row__side">
                <SubscriptionStatusBadge :status="subscription.status" />

                <span class="subscription-row__next">
                  <template v-if="subscription.status === 'Active' || subscription.status === 'PastDue'">
                    {{
                      $t("product_subscriptions.common.next", {
                        date: $d(new Date(subscription.nextOrderDate), "short"),
                      })
                    }}
                  </template>

                  <template v-else-if="subscription.status === 'Paused'">
                    {{
                      subscription.pausedUntil
                        ? $t("product_subscriptions.common.paused_until", {
                            date: $d(new Date(subscription.pausedUntil), "short"),
                          })
                        : $t("product_subscriptions.common.paused")
                    }}
                  </template>

                  <template v-else-if="subscription.status === 'Cancelled' && subscription.cancelledDate">
                    {{
                      $t("product_subscriptions.common.cancelled_on", {
                        date: $d(new Date(subscription.cancelledDate), "short"),
                      })
                    }}
                  </template>
                </span>
              </div>

              <VcIcon name="chevron-right" size="sm" class="subscription-row__chevron" />
            </router-link>
          </li>
        </ul>
      </template>
    </VcWidget>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { DEFAULT_NOTIFICATION_DURATION } from "@/core/constants";
import { Logger } from "@/core/utilities";
import { ROUTES } from "@/router/routes/constants";
import { useNotifications } from "@/shared/notification";
import {
  acceptSubscriptionRenewal,
  getProductSubscriptions,
  getSubscriptionRenewals,
  retrySubscriptionRenewalPayment,
  skipSubscriptionRenewal,
} from "../api/graphql";
import RenewalPanel from "../components/renewal-panel.vue";
import SubscriptionStatusBadge from "../components/subscription-status-badge.vue";
import { ATTENTION_RENEWAL_STATES, SUBSCRIPTION_DETAILS_ROUTE_NAME } from "../constants";
import { discountLabel, subscriptionErrorMessage, intervalLabel } from "../utils";
import type { ProductSubscriptionFieldsFragment, RenewalFieldsFragment } from "../api/graphql/types";

type TabType = "active" | "paused" | "cancelled";

const { t } = useI18n();
const notifications = useNotifications();

usePageHead({ title: t("product_subscriptions.list.title") });

const tabs: { id: TabType; statuses: string[] }[] = [
  { id: "active", statuses: ["Active", "PendingActivation", "PastDue"] },
  { id: "paused", statuses: ["Paused"] },
  { id: "cancelled", statuses: ["Cancelled"] },
];

const loading = ref(false);
const activeTab = ref<TabType>("active");
const subscriptions = ref<ProductSubscriptionFieldsFragment[]>([]);
const renewals = ref<RenewalFieldsFragment[]>([]);
const busy = reactive<Record<string, string | undefined>>({});

// Deliveries the customer can still change, and those already ordered.
const CHANGEABLE_STATES: ReadonlySet<string> = new Set(["Scheduled", "Notified"]);
const UPCOMING_STATES: ReadonlySet<string> = new Set([...CHANGEABLE_STATES, "Ordered", "Authorized"]);

const attentionRenewals = computed(() => renewals.value.filter((x) => ATTENTION_RENEWAL_STATES.has(x.state)));
// Deliveries the customer can still change first (soonest first), then orders already on their way.
const upcomingRenewals = computed(() => {
  const rank = (state: string) => (CHANGEABLE_STATES.has(state) ? 0 : 1);
  return renewals.value
    .filter((x) => !ATTENTION_RENEWAL_STATES.has(x.state) && UPCOMING_STATES.has(x.state))
    .sort(
      (a, b) =>
        rank(a.state) - rank(b.state) || new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime(),
    );
});

const visibleSubscriptions = computed(() => {
  const statuses = tabs.find((x) => x.id === activeTab.value)?.statuses ?? [];
  return subscriptions.value
    .filter((x) => statuses.includes(x.status))
    .sort((a, b) => new Date(a.nextOrderDate).getTime() - new Date(b.nextOrderDate).getTime());
});

function countFor(tab: TabType): number {
  const statuses = tabs.find((x) => x.id === tab)?.statuses ?? [];
  return subscriptions.value.filter((x) => statuses.includes(x.status)).length;
}

async function load(): Promise<void> {
  loading.value = true;
  try {
    const [subscriptionResult, openRenewals, recentRenewals] = await Promise.all([
      getProductSubscriptions({ first: 100 }),
      getSubscriptionRenewals({ onlyOpen: true, first: 20 }),
      getSubscriptionRenewals({ first: 10, sort: "ModifiedDate:desc" }),
    ]);

    subscriptions.value = subscriptionResult?.items ?? [];

    // Open renewals, plus recently failed ones the customer can still fix.
    const failed = (recentRenewals?.items ?? []).filter((x) => x.state === "Failed" && x.canRetryPayment);
    const merged = [...(openRenewals?.items ?? []), ...failed];
    renewals.value = merged.filter((x, i) => merged.findIndex((y) => y.id === x.id) === i);
  } catch (e) {
    Logger.error("subscriptions.load", e);
  } finally {
    loading.value = false;
  }
}

async function onRenewalAction({
  action,
  renewal,
}: {
  action: "accept" | "retry" | "skip";
  renewal: RenewalFieldsFragment;
}) {
  busy[renewal.id] = action;
  try {
    const command = { renewalId: renewal.id };
    if (action === "accept") {
      await acceptSubscriptionRenewal(command);
      notifications.success({
        duration: DEFAULT_NOTIFICATION_DURATION,
        single: true,
        text: t("product_subscriptions.renewal.accepted"),
      });
    } else if (action === "retry") {
      await retrySubscriptionRenewalPayment(command);
      notifications.success({
        duration: DEFAULT_NOTIFICATION_DURATION,
        single: true,
        text: t("product_subscriptions.renewal.retried"),
      });
    } else {
      await skipSubscriptionRenewal(command);
      notifications.success({
        duration: DEFAULT_NOTIFICATION_DURATION,
        single: true,
        text: t("product_subscriptions.renewal.skipped"),
      });
    }

    await load();
  } catch (e) {
    notifications.error({
      duration: DEFAULT_NOTIFICATION_DURATION,
      single: true,
      text: subscriptionErrorMessage(e, t),
    });
  } finally {
    busy[renewal.id] = undefined;
  }
}

onMounted(load);
</script>

<style lang="scss">
.subscriptions-page {
  @apply flex flex-col gap-5;

  &__header {
    @apply flex flex-col gap-3;

    @media (width >= theme("screens.sm")) {
      @apply flex-row items-start justify-between;
    }
  }

  &__subtitle {
    @apply mt-1 text-sm text-neutral-600;
  }

  &__section {
    @apply flex flex-col gap-3;
  }

  &__section-title {
    @apply flex items-center gap-2 text-lg font-bold text-neutral-900;
  }

  &__renewals {
    @apply grid gap-3;

    @media (width >= theme("screens.lg")) {
      @apply grid-cols-2;
    }
  }

  &__tabs {
    @apply flex gap-2 overflow-x-auto border-b border-neutral-200 px-3 py-3;

    @media (width >= theme("screens.md")) {
      @apply px-5;
    }
  }

  &__tab-label {
    @apply flex items-center gap-2;
  }

  &__tab-count {
    @apply rounded-full bg-neutral-100 px-2 text-xs text-neutral-700;
  }

  &__list {
    @apply divide-y divide-neutral-100;
  }
}

.subscription-row {
  @apply flex items-center gap-3 px-3 py-4 transition-colors;

  @media (width >= theme("screens.md")) {
    @apply px-5;
  }

  &:hover,
  &:focus-visible {
    @apply bg-neutral-50;
  }

  &__image {
    @apply size-14 shrink-0 rounded-md border border-neutral-100 bg-additional-50 object-contain;
  }

  &__main {
    @apply min-w-0 grow;
  }

  &__title {
    @apply line-clamp-2 text-sm font-bold text-neutral-900;

    @media (width >= theme("screens.md")) {
      @apply text-base;
    }
  }

  &__meta {
    @apply mt-1 flex flex-wrap gap-x-1 text-xs text-neutral-600;

    @media (width >= theme("screens.md")) {
      @apply text-sm;
    }
  }

  &__side {
    @apply flex shrink-0 flex-col items-end gap-1 text-right;
  }

  &__next {
    @apply text-xs text-neutral-600;
  }

  &__chevron {
    @apply hidden shrink-0 text-neutral-400;

    @media (width >= theme("screens.sm")) {
      @apply block;
    }
  }
}
</style>
