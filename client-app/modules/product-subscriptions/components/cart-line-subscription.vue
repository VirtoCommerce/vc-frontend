<template>
  <div v-if="offer" class="cart-line-subscription" :class="{ 'cart-line-subscription--active': !!subscription }">
    <div class="cart-line-subscription__row">
      <VcCheckbox
        :model-value="!!subscription"
        :disabled="readonly || saving || !isAuthenticated"
        size="sm"
        :test-id="`cart-line-subscribe-${lineItem.id}`"
        @update:model-value="toggle"
      >
        <span class="cart-line-subscription__label">
          {{ $t("product_subscriptions.cart.subscribe") }}
          <VcBadge v-if="savings" color="success" size="sm" variant="soft" rounded>{{ savings }}</VcBadge>
        </span>
      </VcCheckbox>

      <VcSelect
        v-if="subscription"
        :model-value="currentKey"
        :items="intervalItems"
        text-field="label"
        value-field="key"
        size="xs"
        :disabled="readonly || saving"
        class="cart-line-subscription__select"
        :aria-label="$t('product_subscriptions.purchase_options.deliver')"
        @change="changeInterval"
      />

      <VcLoader v-if="saving" size="sm" />
    </div>

    <p v-if="!isAuthenticated" class="cart-line-subscription__hint">
      {{ $t("product_subscriptions.purchase_options.sign_in_required") }}
    </p>

    <p v-else-if="error" class="cart-line-subscription__hint cart-line-subscription__hint--error" role="alert">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, toRef } from "vue";
import { useI18n } from "vue-i18n";
import { useUser } from "@/shared/account/composables/useUser";
import { useFullCart } from "@/shared/cart";
import { useCartSubscriptions } from "../composables/useCartSubscriptions";
import { useSubscriptionOffers } from "../composables/useSubscriptionOffers";
import { discountLabel, errorMessage, intervalKey, intervalLabel, parseIntervalKey } from "../utils";
import type { PreparedLineItemType } from "@/core/types";

interface IProps {
  lineItem: PreparedLineItemType;
  readonly?: boolean;
}

const props = defineProps<IProps>();
const lineItem = toRef(props, "lineItem");

const { t } = useI18n();
const { isAuthenticated } = useUser();
const { forceFetch } = useFullCart();
const { loadOffers, getOffer } = useSubscriptionOffers();
const { byLineItemId, setSubscription, removeSubscription } = useCartSubscriptions();

const offer = getOffer(lineItem.value.productId);
const saving = ref(false);
const error = ref<string>();

const subscription = computed(() => byLineItemId.value.get(lineItem.value.id));
const currentKey = computed(() =>
  subscription.value ? intervalKey(subscription.value.intervalUnit, subscription.value.intervalCount) : undefined,
);
const savings = computed(() =>
  discountLabel(t, offer.value?.discountType, offer.value?.discountValue, lineItem.value.actualPrice?.currency?.code),
);
const intervalItems = computed(() =>
  (offer.value?.intervals ?? []).map((x) => ({
    key: intervalKey(x.unit, x.count),
    label: intervalLabel(t, x.unit, x.count),
  })),
);

async function run(action: () => Promise<void>) {
  saving.value = true;
  error.value = undefined;
  try {
    await action();
    await forceFetch();
  } catch (e) {
    error.value = errorMessage(e, t("product_subscriptions.errors.generic"));
  } finally {
    saving.value = false;
  }
}

function toggle(checked: boolean) {
  if (!offer.value) {
    return;
  }

  if (checked) {
    const defaultInterval = offer.value.intervals.find((x) => x.isDefault) ?? offer.value.intervals[0];
    void run(() =>
      setSubscription(lineItem.value.id, offer.value!.planId, defaultInterval.unit, defaultInterval.count),
    );
  } else {
    void run(() => removeSubscription(lineItem.value.id));
  }
}

function changeInterval(key: string) {
  if (!offer.value || !key) {
    return;
  }

  const { unit, count } = parseIntervalKey(key);
  void run(() => setSubscription(lineItem.value.id, offer.value!.planId, unit, count));
}

onMounted(() => {
  if (lineItem.value.productId) {
    void loadOffers([lineItem.value.productId]);
  }
});
</script>

<style lang="scss">
.cart-line-subscription {
  @apply mt-2 rounded-md border border-dashed border-neutral-300 px-3 py-2;

  &--active {
    @apply border-solid border-success-300 bg-success-50;
  }

  &__row {
    @apply flex flex-wrap items-center gap-x-3 gap-y-2;
  }

  &__label {
    @apply flex items-center gap-2 text-sm font-bold text-neutral-900;
  }

  &__select {
    @apply w-44;
  }

  &__hint {
    @apply mt-1 text-xs text-neutral-600;

    &--error {
      @apply text-danger;
    }
  }
}
</style>
