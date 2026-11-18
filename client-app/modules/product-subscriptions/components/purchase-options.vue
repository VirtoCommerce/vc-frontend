<template>
  <div class="purchase-options" :class="{ 'purchase-options--compact': compact }">
    <AddToCartSimple :product="product">
      <InStock
        v-if="!hideStock"
        :is-in-stock="product.availabilityData?.isInStock"
        :is-digital="product.productType === 'Digital'"
        :quantity="product.availabilityData?.availableQuantity"
      />

      <CountInCart :product-id="product.id" />
    </AddToCartSimple>

    <output
      v-if="offer && lineItem && syncState"
      class="purchase-options__status"
      :class="{ 'purchase-options__status--error': syncState === 'error' }"
    >
      <VcIcon :name="syncState === 'error' ? 'exclamation-circle' : 'refresh'" size="xs" />

      <span v-if="syncState === 'error'">{{ syncError }}</span>

      <span v-else-if="activeSubscription">
        {{
          $t("product_subscriptions.purchase_options.in_cart_subscription", {
            interval: intervalLabel($t, activeSubscription.intervalUnit, activeSubscription.intervalCount),
          })
        }}
      </span>

      <span v-else>{{ $t("product_subscriptions.purchase_options.in_cart_once") }}</span>
    </output>

    <!-- A row of a variation list: one checkbox under the row's own add-to-cart, the frequency once it is ticked. -->
    <div v-if="offer && compact" class="purchase-options__compact">
      <VcCheckbox
        :model-value="mode === 'subscribe'"
        size="sm"
        :disabled="isSaving"
        :test-id="`purchase-option-subscribe-${product.id}`"
        @update:model-value="mode = $event ? 'subscribe' : 'once'"
      >
        {{ $t("product_subscriptions.purchase_options.subscribe") }}
      </VcCheckbox>

      <VcSelect
        v-if="mode === 'subscribe'"
        v-model="selectedInterval"
        class="purchase-options__compact-frequency"
        :items="intervalItems"
        text-field="label"
        value-field="key"
        size="xs"
        :aria-label="$t('product_subscriptions.purchase_options.deliver_every')"
        :disabled="isSaving"
        :test-id-dropdown="`purchase-option-frequency-${product.id}`"
      />
    </div>

    <template v-else-if="offer">
      <fieldset class="purchase-options__choices" :aria-label="$t('product_subscriptions.purchase_options.title')">
        <PurchaseOption
          v-model="mode"
          value="once"
          name="purchase-mode"
          :disabled="isSaving"
          test-id="purchase-option-once"
        >
          <template #title>{{ $t("product_subscriptions.purchase_options.one_time") }}</template>
        </PurchaseOption>

        <PurchaseOption
          v-model="mode"
          value="subscribe"
          name="purchase-mode"
          :disabled="isSaving"
          test-id="purchase-option-subscribe"
        >
          <template #title>{{ $t("product_subscriptions.purchase_options.subscribe") }}</template>

          <SubscriptionFrequencyPicker
            v-model="selectedInterval"
            :intervals="offer.intervals"
            name="purchase-option-frequency"
            :disabled="isSaving"
            test-id="purchase-option-frequency"
          />

          <SubscriptionBenefits class="purchase-options__benefits" />

          <HowItWorksLink class="purchase-options__how" test-id="purchase-option-how-it-works-link" />

          <VcAlert v-if="!isAuthenticated" color="info" size="sm" variant="soft" icon>
            {{ $t("product_subscriptions.purchase_options.sign_in_required") }}
          </VcAlert>
        </PurchaseOption>
      </fieldset>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useUser } from "@/shared/account/composables/useUser";
import { useShortCart } from "@/shared/cart/composables";
import { useDefaultCartSubscriptions } from "../composables/useCartSubscriptions";
import { useSubscriptionOffers } from "../composables/useSubscriptionOffers";
import { subscriptionErrorMessage, intervalKey, intervalLabel, intervalShortLabel, parseIntervalKey } from "../utils";
import HowItWorksLink from "./how-it-works-link.vue";
import PurchaseOption from "./purchase-option.vue";
import SubscriptionBenefits from "./subscription-benefits.vue";
import SubscriptionFrequencyPicker from "./subscription-frequency-picker.vue";
import type { Product } from "@/core/api/graphql/types";
import AddToCartSimple from "@/shared/cart/components/add-to-cart-simple.vue";
import CountInCart from "@/shared/catalog/components/count-in-cart.vue";
import InStock from "@/shared/catalog/components/in-stock.vue";

interface IProps {
  product: Product;
  /** A row of a variation list: a checkbox and a frequency list instead of the full choice. */
  compact?: boolean;
  /** The host shows the stock itself (the variations table has its own column). */
  hideStock?: boolean;
}

const props = defineProps<IProps>();
const product = toRef(props, "product");

const { t } = useI18n();
const { isAuthenticated } = useUser();
const { cart } = useShortCart();
const { loadOffers, offerFor } = useSubscriptionOffers();
const { byLineItemId, setSubscription, removeSubscription } = useDefaultCartSubscriptions();

// By the current product: on a B2C variations page the same block shows whichever variation the options select.
const offer = computed(() => offerFor(product.value.id));
const mode = ref<"once" | "subscribe">("once");
const selectedInterval = ref<string>();
const syncState = ref<"ok" | "saving" | "error">();
const syncError = ref<string>();
// While a change is saved the choice is locked: a second click would race the first request.
const isSaving = computed(() => syncState.value === "saving");

// No prices or discount badges on the options for now: the block's own price stays the one price shown.

const intervalItems = computed(() =>
  (offer.value?.intervals ?? []).map((x) => ({
    key: intervalKey(x.unit, x.count),
    label: intervalShortLabel(t, x.unit, x.count),
  })),
);

const lineItem = computed(() => cart.value?.items?.find((item) => item.productId === product.value.id));
const activeSubscription = computed(() => (lineItem.value ? byLineItemId.value.get(lineItem.value.id) : undefined));

watch(
  offer,
  (value) => {
    if (!value) {
      return;
    }

    selectedInterval.value ??= defaultIntervalKey();
  },
  { immediate: true },
);

// Reflect what is already in the cart when the page opens.
watch(
  activeSubscription,
  (value) => {
    if (value && !isSaving.value) {
      mode.value = "subscribe";
      selectedInterval.value = intervalKey(value.intervalUnit, value.intervalCount);
    }
  },
  { immediate: true },
);

// The core adds the line optimistically (random id, empty sku) before the server answers; only the saved line can carry a choice.
function isSavedLine(item: { sku?: string | null } | undefined): boolean {
  return !!item?.sku;
}

async function syncCartLine(): Promise<void> {
  if (!offer.value || !lineItem.value || !isSavedLine(lineItem.value) || !isAuthenticated.value) {
    return;
  }

  const wantsSubscription = mode.value === "subscribe" && selectedInterval.value;
  const current = activeSubscription.value;

  try {
    if (wantsSubscription) {
      const { unit, count } = parseIntervalKey(selectedInterval.value!);
      if (current?.intervalUnit === unit && current.intervalCount === count) {
        syncState.value = "ok";
        return;
      }

      syncState.value = "saving";
      await setSubscription(lineItem.value.id, offer.value.planId, unit, count);
    } else if (current) {
      syncState.value = "saving";
      await removeSubscription(lineItem.value.id);
    }

    syncState.value = "ok";
    syncError.value = undefined;
  } catch (e) {
    syncState.value = "error";
    syncError.value = subscriptionErrorMessage(e, t);
  }
}

// The core add-to-cart creates the line; the choice is applied to it as soon as it exists or changes.
watch([() => lineItem.value?.id, mode, selectedInterval], () => void syncCartLine());

/** The offer's default frequency (its first when none is marked). */
function defaultIntervalKey(): string | undefined {
  const intervals = offer.value?.intervals ?? [];
  const interval = intervals.find((x) => x.isDefault) ?? intervals[0];
  return interval ? intervalKey(interval.unit, interval.count) : undefined;
}

// A new product (another variation picked on a B2C page) starts from its own offer and cart line.
watch(
  () => product.value.id,
  (id, previous) => {
    if (previous !== undefined) {
      // From the cart, never a blind reset: a variation already subscribed in the cart must keep its subscription.
      const active = activeSubscription.value;
      mode.value = active ? "subscribe" : "once";
      selectedInterval.value = active ? intervalKey(active.intervalUnit, active.intervalCount) : defaultIntervalKey();
      syncState.value = undefined;
      syncError.value = undefined;
    }
    void loadOffers([id]);
  },
  { immediate: true },
);
</script>

<style lang="scss">
.purchase-options {
  @apply flex flex-col gap-3;

  &__choices {
    @apply flex flex-col gap-2;
  }

  &--compact {
    @apply gap-2;
  }

  &__compact {
    @apply flex flex-wrap items-center gap-x-3 gap-y-1.5;
  }

  &__compact-frequency {
    @apply w-36;
  }

  &__status {
    @apply flex items-center gap-1.5 text-xs text-success-700;

    &--error {
      @apply text-danger;
    }
  }
}
</style>
