<template>
  <div class="subscription-details">
    <VcButton
      variant="ghost"
      size="sm"
      prepend-icon="chevron-left"
      :to="{ name: SUBSCRIPTIONS_ROUTE_NAME }"
      class="self-start"
    >
      {{ $t("product_subscriptions.details.back") }}
    </VcButton>

    <VcLoaderOverlay v-if="loading && !subscription" />

    <VcEmptyView v-else-if="!subscription" :text="$t('product_subscriptions.details.not_found')" icon="refresh" />

    <template v-else>
      <!-- Product header -->
      <div class="subscription-details__hero">
        <VcImage
          :src="subscription.imageUrl"
          :alt="subscription.productName ?? ''"
          class="subscription-details__image"
        />

        <div class="min-w-0 grow">
          <div class="flex flex-wrap items-center gap-2">
            <SubscriptionStatusBadge :status="subscription.status" />

            <span class="text-xs text-neutral-500">#{{ subscription.number }}</span>
          </div>

          <VcTypography tag="h1" class="subscription-details__title">{{ subscription.productName }}</VcTypography>

          <p class="text-sm text-neutral-600">
            {{ intervalLabel($t, subscription.intervalUnit, subscription.intervalCount) }}
            <template v-if="savings"> · {{ savings }}</template>
          </p>
        </div>
      </div>

      <!-- Status messages -->
      <VcAlert
        v-if="subscription.status === 'PastDue'"
        color="danger"
        variant="soft"
        icon
        data-test-id="subscription-past-due"
      >
        {{ $t("product_subscriptions.details.past_due") }}
      </VcAlert>

      <VcAlert v-else-if="subscription.status === 'PendingActivation'" color="info" variant="soft" icon>
        {{ $t("product_subscriptions.details.pending") }}
      </VcAlert>

      <VcAlert v-else-if="subscription.status === 'Paused'" color="info" variant="soft" icon>
        {{
          subscription.pausedUntil
            ? $t("product_subscriptions.details.paused_until", {
                date: $d(new Date(subscription.pausedUntil), "short"),
              })
            : $t("product_subscriptions.details.paused")
        }}
      </VcAlert>

      <VcAlert v-else-if="subscription.status === 'Cancelled'" color="info" variant="soft" icon>
        {{
          $t("product_subscriptions.details.cancelled", {
            date: subscription.cancelledDate ? $d(new Date(subscription.cancelledDate), "short") : "",
          })
        }}
      </VcAlert>

      <div class="subscription-details__grid">
        <div class="subscription-details__main">
          <!-- Next delivery -->
          <VcWidget
            v-if="subscription.status !== 'Cancelled'"
            :title="$t('product_subscriptions.details.next_delivery')"
            prepend-icon="truck"
            size="lg"
          >
            <RenewalPanel
              v-if="currentRenewal"
              :renewal="currentRenewal"
              :busy="renewalBusy"
              @action="onRenewalAction"
            />

            <div
              v-else-if="subscription.status === 'Active' || subscription.status === 'PastDue'"
              class="subscription-details__next"
            >
              <div class="text-2xl font-bold text-neutral-900">
                {{ $d(new Date(subscription.nextOrderDate), "short") }}
              </div>

              <p class="text-sm text-neutral-600">{{ $t("product_subscriptions.details.next_hint") }}</p>
            </div>

            <p v-else class="text-sm text-neutral-600">{{ $t("product_subscriptions.details.no_next") }}</p>

            <div v-if="subscription.canSkip || subscription.canOrderNow" class="subscription-details__quick">
              <VcButton
                v-if="subscription.canOrderNow"
                size="sm"
                prepend-icon="lightning-bolt"
                :loading="busy === 'orderNow'"
                data-test-id="subscription-order-now"
                @click="confirmAction = 'orderNow'"
              >
                {{ $t("product_subscriptions.details.order_now") }}
              </VcButton>

              <VcButton
                v-if="subscription.canSkip"
                size="sm"
                variant="outline"
                prepend-icon="fast-forward"
                :loading="busy === 'skip'"
                data-test-id="subscription-skip"
                @click="run('skip')"
              >
                {{ $t("product_subscriptions.details.skip_next") }}
              </VcButton>
            </div>
          </VcWidget>

          <!-- Manage -->
          <VcWidget
            v-if="subscription.canChange"
            :title="$t('product_subscriptions.details.manage')"
            prepend-icon="pencil"
            size="lg"
          >
            <form class="subscription-details__form" @submit.prevent="save">
              <VcInput
                v-model.number="form.quantity"
                type="number"
                :min="1"
                :max="9999"
                :label="$t('product_subscriptions.details.quantity')"
                name="quantity"
                data-test-id="subscription-quantity"
              />

              <VcSelect
                v-model="form.interval"
                :label="$t('product_subscriptions.details.frequency')"
                :items="intervalItems"
                text-field="label"
                value-field="key"
                data-test-id="subscription-frequency"
              />

              <VcDatePicker
                v-if="subscription.status !== 'Paused'"
                v-model="form.nextOrderDate"
                :label="$t('product_subscriptions.details.next_date')"
                :min="minDate"
                :max="maxDate"
                enable-teleport
                data-test-id="subscription-next-date"
              />

              <VcSelect
                v-model="form.savedPaymentMethodId"
                :label="$t('product_subscriptions.details.payment_card')"
                :items="cardItems"
                text-field="label"
                value-field="id"
                :placeholder="$t('product_subscriptions.details.choose_card')"
                data-test-id="subscription-card"
              />

              <div class="subscription-details__form-actions">
                <VcButton
                  type="submit"
                  :disabled="!isDirty"
                  :loading="busy === 'save'"
                  data-test-id="subscription-save"
                >
                  {{ $t("product_subscriptions.details.save") }}
                </VcButton>

                <VcButton v-if="isDirty" variant="ghost" color="neutral" @click="resetForm">{{
                  $t("product_subscriptions.details.reset")
                }}</VcButton>

                <router-link :to="{ name: PAYMENT_METHODS_ROUTE_NAME }" class="text-sm text-primary hover:underline">
                  {{ $t("product_subscriptions.details.manage_cards") }}
                </router-link>
              </div>
            </form>
          </VcWidget>

          <!-- History -->
          <VcWidget :title="$t('product_subscriptions.details.history')" prepend-icon="clock" size="lg">
            <p v-if="!history.length" class="text-sm text-neutral-600">
              {{ $t("product_subscriptions.details.no_history") }}
            </p>

            <ul v-else class="subscription-details__history">
              <li v-for="renewal in history" :key="renewal.id">
                <span class="font-bold">{{ $d(new Date(renewal.scheduledDate), "short") }}</span>

                <SubscriptionStatusBadge :status="renewal.state" />

                <router-link
                  v-if="renewal.orderId"
                  :to="{ name: 'OrderDetails', params: { orderId: renewal.orderId } }"
                  class="text-primary hover:underline"
                >
                  {{ renewal.orderNumber }}
                </router-link>

                <span class="ml-auto font-bold">{{
                  formatMoney(renewal.orderTotal ?? renewal.previewTotal, renewal.currency)
                }}</span>
              </li>
            </ul>
          </VcWidget>
        </div>

        <aside class="subscription-details__aside">
          <VcWidget :title="$t('product_subscriptions.details.summary')" size="lg">
            <dl class="subscription-details__facts">
              <dt>{{ $t("product_subscriptions.details.started") }}</dt>

              <dd>{{ $d(new Date(subscription.startDate), "short") }}</dd>

              <dt>{{ $t("product_subscriptions.details.deliveries") }}</dt>

              <dd>{{ subscription.ordersCount }}</dd>

              <template v-if="subscription.referencePrice">
                <dt>{{ $t("product_subscriptions.details.price") }}</dt>

                <dd>{{ formatMoney(subscription.referencePrice, subscription.currency) }}</dd>
              </template>

              <template v-if="subscription.savedPaymentMethod">
                <dt>{{ $t("product_subscriptions.details.paid_with") }}</dt>

                <dd>{{ cardLabel(subscription.savedPaymentMethod.brand, subscription.savedPaymentMethod.last4) }}</dd>
              </template>

              <template v-if="subscription.shippingAddress">
                <dt>{{ $t("product_subscriptions.details.ships_to") }}</dt>

                <dd>
                  {{ subscription.shippingAddress.firstName }} {{ subscription.shippingAddress.lastName }}<br />

                  {{ subscription.shippingAddress.line1 }}<br />
                  {{ subscription.shippingAddress.city }} {{ subscription.shippingAddress.regionName }}
                  {{ subscription.shippingAddress.postalCode }}
                </dd>
              </template>

              <template v-if="subscription.initialOrderId">
                <dt>{{ $t("product_subscriptions.details.first_order") }}</dt>

                <dd>
                  <router-link
                    :to="{ name: 'OrderDetails', params: { orderId: subscription.initialOrderId } }"
                    class="text-primary hover:underline"
                  >
                    {{ subscription.initialOrderNumber }}
                  </router-link>
                </dd>
              </template>
            </dl>
          </VcWidget>

          <VcWidget
            v-if="subscription.canPause || subscription.canResume || subscription.canCancel"
            :title="$t('product_subscriptions.details.actions')"
            size="lg"
          >
            <div class="flex flex-col gap-2">
              <VcButton
                v-if="subscription.canResume"
                full-width
                prepend-icon="play"
                :loading="busy === 'resume'"
                data-test-id="subscription-resume"
                @click="run('resume')"
              >
                {{ $t("product_subscriptions.details.resume") }}
              </VcButton>

              <VcButton
                v-if="subscription.canPause"
                full-width
                variant="outline"
                prepend-icon="pause"
                data-test-id="subscription-pause"
                @click="showPause = true"
              >
                {{ $t("product_subscriptions.details.pause") }}
              </VcButton>

              <VcButton
                v-if="subscription.canCancel"
                full-width
                variant="outline"
                color="danger"
                prepend-icon="x"
                data-test-id="subscription-cancel"
                @click="showCancel = true"
              >
                {{ $t("product_subscriptions.details.cancel") }}
              </VcButton>
            </div>
          </VcWidget>
        </aside>
      </div>
    </template>

    <!-- Pause -->
    <VcModal
      :show="showPause"
      :title="$t('product_subscriptions.pause.title')"
      icon="pause"
      max-width="28rem"
      @close="showPause = false"
    >
      <p class="mb-4 text-sm">{{ $t("product_subscriptions.pause.text") }}</p>

      <div class="flex flex-col gap-2">
        <label v-for="option in pauseOptions" :key="option.id" class="subscription-details__pause-option">
          <VcRadioButton v-model="pauseChoice" :value="option.id" name="pause" size="sm" />
          {{ option.label }}
        </label>
      </div>

      <template #actions="{ close }">
        <VcButton variant="outline" color="neutral" @click="close">{{
          $t("product_subscriptions.common.back")
        }}</VcButton>

        <VcButton :loading="busy === 'pause'" data-test-id="subscription-pause-confirm" @click="pause">{{
          $t("product_subscriptions.pause.confirm")
        }}</VcButton>
      </template>
    </VcModal>

    <!-- Cancel -->
    <VcModal
      :show="showCancel"
      :title="$t('product_subscriptions.cancel.title')"
      icon="exclamation-circle"
      variant="danger"
      max-width="28rem"
      @close="showCancel = false"
    >
      <p class="mb-4 text-sm">{{ $t("product_subscriptions.cancel.text") }}</p>

      <VcSelect
        v-model="cancelReason"
        :label="$t('product_subscriptions.cancel.reason')"
        :items="cancelReasons"
        text-field="label"
        value-field="id"
        :placeholder="$t('product_subscriptions.cancel.reason_optional')"
        enable-teleport
      />

      <template #actions="{ close }">
        <VcButton variant="outline" color="neutral" @click="close">{{
          $t("product_subscriptions.cancel.keep")
        }}</VcButton>

        <VcButton
          color="danger"
          :loading="busy === 'cancel'"
          data-test-id="subscription-cancel-confirm"
          @click="cancel"
          >{{ $t("product_subscriptions.cancel.confirm") }}</VcButton
        >
      </template>
    </VcModal>

    <!-- Order now -->
    <VcModal
      :show="confirmAction === 'orderNow'"
      :title="$t('product_subscriptions.order_now.title')"
      icon="lightning-bolt"
      max-width="28rem"
      @close="confirmAction = undefined"
    >
      <p class="text-sm">{{ $t("product_subscriptions.order_now.text") }}</p>

      <template #actions="{ close }">
        <VcButton variant="outline" color="neutral" @click="close">{{
          $t("product_subscriptions.common.back")
        }}</VcButton>

        <VcButton :loading="busy === 'orderNow'" data-test-id="subscription-order-now-confirm" @click="orderNow">{{
          $t("product_subscriptions.order_now.confirm")
        }}</VcButton>
      </template>
    </VcModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { Logger } from "@/core/utilities";
import { useNotifications } from "@/shared/notification";
import {
  acceptSubscriptionRenewal,
  cancelProductSubscription,
  changeProductSubscription,
  getProductSubscription,
  getSubscriptionRenewals,
  orderProductSubscriptionNow,
  pauseProductSubscription,
  resumeProductSubscription,
  retrySubscriptionRenewalPayment,
  skipProductSubscription,
  skipSubscriptionRenewal,
} from "../api/graphql";
import RenewalPanel from "../components/renewal-panel.vue";
import SubscriptionStatusBadge from "../components/subscription-status-badge.vue";
import { useSavedPaymentMethods } from "../composables/useSavedPaymentMethods";
import { PAYMENT_METHODS_ROUTE_NAME, SUBSCRIPTIONS_ROUTE_NAME } from "../constants";
import {
  cardLabel,
  discountLabel,
  errorMessage,
  formatMoney,
  intervalKey,
  intervalLabel,
  parseIntervalKey,
  toDateInputValue,
} from "../utils";
import type { GetProductSubscriptionQuery, RenewalFieldsFragment } from "../api/graphql/types";

type SubscriptionType = NonNullable<GetProductSubscriptionQuery["productSubscription"]>;

const props = defineProps<{ subscriptionId: string }>();

const { t } = useI18n();
const notifications = useNotifications();
const { activeMethods, fetch: fetchCards } = useSavedPaymentMethods();

usePageHead({ title: t("product_subscriptions.details.meta_title") });

const loading = ref(false);
const busy = ref<string>();
const renewalBusy = ref<string>();
const subscription = ref<SubscriptionType>();
const history = ref<RenewalFieldsFragment[]>([]);
const showPause = ref(false);
const showCancel = ref(false);
const confirmAction = ref<"orderNow">();
const pauseChoice = ref("4w");
const cancelReason = ref<string>();

const form = reactive({
  quantity: 1,
  interval: "",
  nextOrderDate: undefined as string | undefined,
  savedPaymentMethodId: undefined as string | undefined,
});

const currentRenewal = computed(() => subscription.value?.currentRenewal ?? undefined);
const savings = computed(() =>
  discountLabel(t, subscription.value?.discountType, subscription.value?.discountValue, subscription.value?.currency),
);
const intervalItems = computed(() =>
  (subscription.value?.availableIntervals ?? []).map((x) => ({
    key: intervalKey(x.unit, x.count),
    label: intervalLabel(t, x.unit, x.count),
  })),
);
const cardItems = computed(() => {
  const items = activeMethods.value.map((x) => ({
    id: x.id,
    label: `${cardLabel(x.brand, x.last4)} · ${x.expirationMonth}/${x.expirationYear}`,
  }));
  const current = subscription.value?.savedPaymentMethod;
  if (current && !items.some((x) => x.id === current.id)) {
    items.unshift({
      id: current.id,
      label: [
        cardLabel(current.brand, current.last4),
        t(`product_subscriptions.card_status.${current.status}`, current.status),
      ].join(" · "),
    });
  }

  return items;
});

const minDate = computed(() => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return toDateInputValue(date);
});
const maxDate = computed(() => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return toDateInputValue(date);
});

const pauseOptions = computed(() => [
  { id: "2w", label: t("product_subscriptions.pause.options.2w"), days: 14 },
  { id: "4w", label: t("product_subscriptions.pause.options.4w"), days: 28 },
  { id: "8w", label: t("product_subscriptions.pause.options.8w"), days: 56 },
  { id: "open", label: t("product_subscriptions.pause.options.open"), days: 0 },
]);

const cancelReasons = computed(() =>
  ["too_much", "too_often", "not_needed", "price", "other"].map((id) => ({
    id,
    label: t(`product_subscriptions.cancel.reasons.${id}`),
  })),
);

const isDirty = computed(() => {
  const s = subscription.value;
  if (!s) {
    return false;
  }

  return (
    form.quantity !== s.quantity ||
    form.interval !== intervalKey(s.intervalUnit, s.intervalCount) ||
    (s.status !== "Paused" && form.nextOrderDate !== toDateInputValue(s.nextOrderDate)) ||
    (form.savedPaymentMethodId ?? null) !== (s.storedPaymentMethodId ?? null)
  );
});

function resetForm() {
  const s = subscription.value;
  if (!s) {
    return;
  }

  form.quantity = s.quantity;
  form.interval = intervalKey(s.intervalUnit, s.intervalCount);
  form.nextOrderDate = toDateInputValue(s.nextOrderDate);
  form.savedPaymentMethodId = s.storedPaymentMethodId ?? undefined;
}

async function load() {
  loading.value = true;
  try {
    const [result, renewals] = await Promise.all([
      getProductSubscription(props.subscriptionId),
      getSubscriptionRenewals({ subscriptionId: props.subscriptionId, first: 20, sort: "ScheduledDate:desc" }),
    ]);
    subscription.value = result ?? undefined;
    history.value = (renewals?.items ?? []).filter((x) => x.id !== result?.currentRenewal?.id);
    resetForm();
  } catch (e) {
    Logger.error("subscription-details.load", e);
  } finally {
    loading.value = false;
  }
}

async function execute(key: string, action: () => Promise<unknown>, successText: string) {
  busy.value = key;
  try {
    await action();
    notifications.success({ text: successText });
    await load();
    return true;
  } catch (e) {
    notifications.error({ text: errorMessage(e, t("product_subscriptions.errors.generic")) });
    return false;
  } finally {
    busy.value = undefined;
  }
}

function run(action: "skip" | "resume") {
  const command = { subscriptionId: props.subscriptionId };
  if (action === "skip") {
    void execute("skip", () => skipProductSubscription(command), t("product_subscriptions.details.skipped"));
  } else {
    void execute("resume", () => resumeProductSubscription(command), t("product_subscriptions.details.resumed"));
  }
}

async function save() {
  const s = subscription.value;
  if (!s || !isDirty.value) {
    return;
  }

  const { unit, count } = parseIntervalKey(form.interval);
  const command = {
    subscriptionId: s.id,
    quantity: form.quantity !== s.quantity ? form.quantity : undefined,
    intervalUnit: unit !== s.intervalUnit || count !== s.intervalCount ? unit : undefined,
    intervalCount: unit !== s.intervalUnit || count !== s.intervalCount ? count : undefined,
    nextOrderDate:
      s.status !== "Paused" && form.nextOrderDate && form.nextOrderDate !== toDateInputValue(s.nextOrderDate)
        ? new Date(`${form.nextOrderDate}T12:00:00`).toISOString()
        : undefined,
    savedPaymentMethodId:
      form.savedPaymentMethodId && form.savedPaymentMethodId !== s.storedPaymentMethodId
        ? form.savedPaymentMethodId
        : undefined,
  };

  await execute("save", () => changeProductSubscription(command), t("product_subscriptions.details.saved"));
}

async function pause() {
  const option = pauseOptions.value.find((x) => x.id === pauseChoice.value);
  let resumeDate: string | undefined;
  if (option?.days) {
    const date = new Date();
    date.setDate(date.getDate() + option.days);
    resumeDate = date.toISOString();
  }

  const ok = await execute(
    "pause",
    () => pauseProductSubscription({ subscriptionId: props.subscriptionId, resumeDate }),
    t("product_subscriptions.details.paused_done"),
  );
  if (ok) {
    showPause.value = false;
  }
}

async function cancel() {
  const reason = cancelReasons.value.find((x) => x.id === cancelReason.value)?.label;
  const ok = await execute(
    "cancel",
    () => cancelProductSubscription({ subscriptionId: props.subscriptionId, reason }),
    t("product_subscriptions.details.cancelled_done"),
  );
  if (ok) {
    showCancel.value = false;
  }
}

async function orderNow() {
  const ok = await execute(
    "orderNow",
    () => orderProductSubscriptionNow({ subscriptionId: props.subscriptionId }),
    t("product_subscriptions.details.ordered"),
  );
  if (ok) {
    confirmAction.value = undefined;
  }
}

async function onRenewalAction({
  action,
  renewal,
}: {
  action: "accept" | "retry" | "skip";
  renewal: RenewalFieldsFragment;
}) {
  renewalBusy.value = action;
  try {
    const command = { renewalId: renewal.id };
    if (action === "accept") {
      await acceptSubscriptionRenewal(command);
    } else if (action === "retry") {
      await retrySubscriptionRenewalPayment(command);
    } else {
      await skipSubscriptionRenewal(command);
    }

    const messageKeys = { accept: "accepted", retry: "retried", skip: "skipped" } as const;
    notifications.success({ text: t(`product_subscriptions.renewal.${messageKeys[action]}`) });
    await load();
  } catch (e) {
    notifications.error({ text: errorMessage(e, t("product_subscriptions.errors.generic")) });
  } finally {
    renewalBusy.value = undefined;
  }
}

watch(() => props.subscriptionId, load);

onMounted(() => {
  void load();
  void fetchCards();
});
</script>

<style lang="scss">
.subscription-details {
  @apply flex flex-col gap-5;

  &__hero {
    @apply flex items-center gap-4;
  }

  &__image {
    @apply size-20 shrink-0 rounded-lg border border-neutral-100 bg-additional-50 object-contain md:size-24;
  }

  &__title {
    @apply mt-1 text-xl md:text-2xl;
  }

  &__grid {
    @apply grid gap-5 lg:grid-cols-[1fr_20rem];
  }

  &__main,
  &__aside {
    @apply flex min-w-0 flex-col gap-5;
  }

  &__next {
    @apply flex flex-col gap-1;
  }

  &__quick {
    @apply mt-4 flex flex-wrap gap-2;
  }

  &__form {
    @apply grid gap-4 sm:grid-cols-2;
  }

  &__form-actions {
    @apply flex flex-wrap items-center gap-3 sm:col-span-2;
  }

  &__history {
    @apply flex flex-col divide-y divide-neutral-100;

    li {
      @apply flex flex-wrap items-center gap-3 py-3 text-sm;
    }
  }

  &__facts {
    @apply grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm;

    dt {
      @apply text-neutral-600;
    }

    dd {
      @apply text-right font-bold text-neutral-900;
    }
  }

  &__pause-option {
    @apply flex cursor-pointer items-center gap-3 rounded-md border border-neutral-200 p-3 text-sm;
  }
}
</style>
