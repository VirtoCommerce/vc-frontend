<template>
  <div class="subscriptions">
    <div class="subscriptions__header">
      <div>
        <VcTypography tag="h1">{{ $t("product_subscriptions.list.title") }}</VcTypography>

        <p class="subscriptions__subtitle">{{ $t("product_subscriptions.list.subtitle") }}</p>
      </div>

      <VcButton variant="outline" size="sm" prepend-icon="credit-card" :to="{ name: ROUTES.PAYMENT_METHODS.NAME }">
        {{ $t("shared.payment.saved_cards.page_title") }}
      </VcButton>
    </div>

    <!-- Deliveries that need the customer -->
    <section v-if="attentionRenewals.length" class="subscriptions__section" aria-labelledby="ps-attention">
      <VcTypography id="ps-attention" tag="h2" variant="h3" class="subscriptions__section-title">
        <VcIcon name="exclamation-circle" size="sm" color="warning" />
        {{ $t("product_subscriptions.list.needs_attention") }}
      </VcTypography>

      <div class="subscriptions__renewals">
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
    <section v-if="upcomingRenewals.length" class="subscriptions__section" aria-labelledby="ps-upcoming">
      <VcTypography id="ps-upcoming" tag="h2" variant="h3" class="subscriptions__section-title">
        <VcIcon name="truck" size="sm" />
        {{ $t("product_subscriptions.list.upcoming") }}
      </VcTypography>

      <div class="subscriptions__renewals">
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
        <div class="subscriptions__tabs" role="group" :aria-label="$t('product_subscriptions.list.tabs_label')">
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
            <span class="subscriptions__tab-label">
              {{ $t(`product_subscriptions.list.tabs.${tab.id}`) }}
              <span class="subscriptions__tab-count">{{ countFor(tab.id) }}</span>
            </span>
          </VcTabSwitch>
        </div>

        <VcLoaderOverlay v-if="loading && !subscriptions.length" />

        <div v-else-if="loadFailed" class="subscriptions__error">
          <VcAlert color="danger" variant="soft" icon role="alert" data-test-id="subscriptions-load-failed">
            {{ $t("product_subscriptions.list.load_failed") }}

            <VcButton size="xs" variant="outline" class="subscriptions__retry" @click="load">
              {{ $t("product_subscriptions.common.retry") }}
            </VcButton>
          </VcAlert>
        </div>

        <VcEmptyView v-else-if="!visibleSubscriptions.length" :text="emptyText" icon="refresh">
          <template v-if="activeTab === 'active'" #button>
            <VcButton :to="{ name: 'Catalog' }">{{ $t("product_subscriptions.list.browse") }}</VcButton>
          </template>
        </VcEmptyView>

        <ul v-else class="subscriptions__list">
          <li v-for="subscription in visibleSubscriptions" :key="subscription.id" class="subscriptions__item">
            <SubscriptionRow :subscription="subscription" />
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
import SubscriptionRow from "../components/subscription-row.vue";
import { ATTENTION_RENEWAL_STATES } from "../constants";
import { fetchAllPages, subscriptionErrorMessage } from "../utils";
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

const SUBSCRIPTIONS_PAGE_SIZE = 100;
const RENEWALS_PAGE_SIZE = 50;

const loading = ref(false);
const loadFailed = ref(false);
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

// "No subscriptions yet" only when there are none at all, not when the other tabs have some.
const emptyText = computed(() =>
  activeTab.value === "active" && subscriptions.value.length
    ? t("product_subscriptions.list.empty.no_active")
    : t(`product_subscriptions.list.empty.${activeTab.value}`),
);

function countFor(tab: TabType): number {
  const statuses = tabs.find((x) => x.id === tab)?.statuses ?? [];
  return subscriptions.value.filter((x) => statuses.includes(x.status)).length;
}

async function load(): Promise<void> {
  loading.value = true;
  loadFailed.value = false;
  try {
    // The tabs count every subscription and the sections show every open renewal, so both lists are read in full.
    // A fixed sort keeps the renewal pages from overlapping.
    const [allSubscriptions, openRenewals, recentRenewals] = await Promise.all([
      fetchAllPages((page) => getProductSubscriptions(page), SUBSCRIPTIONS_PAGE_SIZE),
      fetchAllPages(
        (page) => getSubscriptionRenewals({ ...page, onlyOpen: true, sort: "ScheduledDate:asc" }),
        RENEWALS_PAGE_SIZE,
      ),
      getSubscriptionRenewals({ first: 10, sort: "ModifiedDate:desc" }),
    ]);

    subscriptions.value = allSubscriptions;

    // Open renewals, plus recently failed ones the customer can still fix.
    const failed = (recentRenewals?.items ?? []).filter((x) => x.state === "Failed" && x.canRetryPayment);
    const merged = [...openRenewals, ...failed];
    renewals.value = merged.filter((x, i) => merged.findIndex((y) => y.id === x.id) === i);
  } catch (e) {
    Logger.error("subscriptions.load", e);
    loadFailed.value = true;
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
.subscriptions {
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
    @apply flex items-center gap-2;
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

  &__error {
    @apply p-3;

    @media (width >= theme("screens.md")) {
      @apply p-5;
    }
  }

  &__retry {
    @apply mt-2;
  }

  &__list {
    @apply divide-y divide-neutral-100;
  }
}
</style>
