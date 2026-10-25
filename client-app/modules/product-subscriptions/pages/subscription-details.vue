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
          <!-- Placed deliveries that still need the customer (payment to confirm, retry, failed) -->
          <VcWidget
            v-if="attentionRenewals.length"
            :title="$t('product_subscriptions.list.needs_attention')"
            prepend-icon="exclamation-circle"
            size="lg"
            data-test-id="subscription-attention"
          >
            <div class="flex flex-col gap-3">
              <RenewalPanel
                v-for="renewal in attentionRenewals"
                :key="renewal.id"
                :renewal="renewal"
                :busy="renewalBusy"
                @action="onRenewalAction"
              />
            </div>
          </VcWidget>

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

            <div v-if="subscription.canSkip || canOrderNow" class="subscription-details__quick">
              <VcButton
                v-if="canOrderNow"
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
                :min="quantityMin"
                :max="quantityRules.maxQuantity ?? 9999"
                :step="quantityRules.packSize"
                :label="$t('product_subscriptions.details.quantity')"
                :message="quantityError ?? quantityHint"
                :error="!!quantityError"
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
                  :disabled="!isDirty || !!quantityError"
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
                  <span v-for="line in addressLines" :key="line" class="block">{{ line }}</span>
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
        <div v-for="option in pauseOptions" :key="option.id" class="subscription-details__pause-option">
          <VcRadioButton
            v-model="pauseChoice"
            :value="option.id"
            :label="option.label"
            name="pause"
            size="sm"
            class="subscription-details__pause-radio"
          />
        </div>
      </div>

      <template #actions="{ close }">
        <div class="subscription-details__modal-actions">
          <VcButton class="max-sm:w-full" variant="outline" color="neutral" @click="close">{{
            $t("product_subscriptions.common.back")
          }}</VcButton>

          <VcButton
            class="max-sm:w-full"
            :loading="busy === 'pause'"
            data-test-id="subscription-pause-confirm"
            @click="pause"
            >{{ $t("product_subscriptions.pause.confirm") }}</VcButton
          >
        </div>
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
        <div class="subscription-details__modal-actions">
          <VcButton class="max-sm:w-full" variant="outline" color="neutral" @click="close">{{
            $t("product_subscriptions.cancel.keep")
          }}</VcButton>

          <VcButton
            class="max-sm:w-full"
            color="danger"
            :loading="busy === 'cancel'"
            data-test-id="subscription-cancel-confirm"
            @click="cancel"
            >{{ $t("product_subscriptions.cancel.confirm") }}</VcButton
          >
        </div>
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
        <div class="subscription-details__modal-actions">
          <VcButton class="max-sm:w-full" variant="outline" color="neutral" @click="close">{{
            $t("product_subscriptions.common.back")
          }}</VcButton>

          <VcButton
            class="max-sm:w-full"
            :loading="busy === 'orderNow'"
            data-test-id="subscription-order-now-confirm"
            @click="orderNow"
            >{{ $t("product_subscriptions.order_now.confirm") }}</VcButton
          >
        </div>
      </template>
    </VcModal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { DEFAULT_NOTIFICATION_DURATION } from "@/core/constants";
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
import { ATTENTION_RENEWAL_STATES, PAYMENT_METHODS_ROUTE_NAME, SUBSCRIPTIONS_ROUTE_NAME } from "../constants";
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
const attentionRenewals = ref<RenewalFieldsFragment[]>([]);

// A placed order still waiting for its payment must finish before another one can be placed.
const canOrderNow = computed(
  () =>
    !!subscription.value?.canOrderNow &&
    !attentionRenewals.value.some((x) => ["Ordered", "PaymentActionRequired", "RetryScheduled"].includes(x.state)),
);
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

const addressLines = computed(() => {
  const a = subscription.value?.shippingAddress;
  if (!a) {
    return [];
  }

  const region = [a.regionName, a.postalCode].filter(Boolean).join(" ");
  return [
    [a.firstName, a.lastName].filter(Boolean).join(" "),
    a.line1,
    a.line2,
    [a.city, region].filter(Boolean).join(", "),
  ].filter((x): x is string => !!x);
});

const quantityRules = computed(
  () => subscription.value?.quantityRules ?? { packSize: 1, minQuantity: 1, maxQuantity: null },
);

// The browser counts `step` from `min`, so min must itself be a multiple of the pack size.
const quantityMin = computed(() => {
  const { packSize, minQuantity } = quantityRules.value;
  const min = Math.max(1, minQuantity);
  return packSize > 1 ? Math.ceil(min / packSize) * packSize : min;
});

const quantityHint = computed(() =>
  quantityRules.value.packSize > 1
    ? t("product_subscriptions.details.quantity_pack", { packSize: quantityRules.value.packSize })
    : undefined,
);

const quantityError = computed<string | undefined>(() => {
  const { packSize, maxQuantity } = quantityRules.value;
  const quantity = Number(form.quantity);

  if (!Number.isInteger(quantity) || quantity < quantityMin.value) {
    return t("product_subscriptions.details.quantity_min", { min: quantityMin.value });
  }
  if (maxQuantity && quantity > maxQuantity) {
    return t("product_subscriptions.details.quantity_max", { max: maxQuantity });
  }
  if (packSize > 1 && quantity % packSize !== 0) {
    return t("product_subscriptions.details.quantity_pack", { packSize });
  }
  return undefined;
});

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
    const items = (renewals?.items ?? []).filter((x) => x.id !== result?.currentRenewal?.id);
    attentionRenewals.value = items.filter(
      (x) => ATTENTION_RENEWAL_STATES.has(x.state) && (x.state !== "Failed" || x.canRetryPayment),
    );
    history.value = items.filter((x) => !attentionRenewals.value.some((y) => y.id === x.id));
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
    notifications.success({ duration: DEFAULT_NOTIFICATION_DURATION, single: true, text: successText });
    await load();
    return true;
  } catch (e) {
    notifications.error({
      duration: DEFAULT_NOTIFICATION_DURATION,
      single: true,
      text: errorMessage(e, t("product_subscriptions.errors.generic")),
    });
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
  if (!s || !isDirty.value || quantityError.value) {
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
  busy.value = "orderNow";
  try {
    const renewal = await orderProductSubscriptionNow({ subscriptionId: props.subscriptionId });
    confirmAction.value = undefined;

    if (renewal && ATTENTION_RENEWAL_STATES.has(renewal.state)) {
      notifications.warning({
        duration: DEFAULT_NOTIFICATION_DURATION,
        single: true,
        text: t("product_subscriptions.details.order_needs_attention"),
      });
    } else {
      notifications.success({
        duration: DEFAULT_NOTIFICATION_DURATION,
        single: true,
        text: t("product_subscriptions.details.ordered"),
      });
    }

    await load();
  } catch (e) {
    notifications.error({
      duration: DEFAULT_NOTIFICATION_DURATION,
      single: true,
      text: errorMessage(e, t("product_subscriptions.errors.generic")),
    });
  } finally {
    busy.value = undefined;
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
    notifications.success({
      duration: DEFAULT_NOTIFICATION_DURATION,
      single: true,
      text: t(`product_subscriptions.renewal.${messageKeys[action]}`),
    });
    await load();
  } catch (e) {
    notifications.error({
      duration: DEFAULT_NOTIFICATION_DURATION,
      single: true,
      text: errorMessage(e, t("product_subscriptions.errors.generic")),
    });
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
  &__modal-actions {
    @apply flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end;
  }

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
    @apply rounded-md border border-neutral-200 text-sm;
  }

  // the radio's own label fills the option, so the whole option selects it
  &__pause-radio {
    @apply w-full;

    .vc-radio-button__container {
      @apply w-full items-center gap-3 p-3;
    }
  }
}
</style>
