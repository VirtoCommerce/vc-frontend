<template>
  <div class="purchase-options">
    <AddToCartSimple :product="product">
      <InStock
        :is-in-stock="product.availabilityData?.isInStock"
        :is-digital="product.productType === 'Digital'"
        :quantity="product.availabilityData?.availableQuantity"
      />

      <CountInCart :product-id="product.id" />
    </AddToCartSimple>

    <output
      v-if="offer && lineItem && syncState"
      class="purchase-options__status"
      :class="`purchase-options__status--${syncState}`"
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

    <template v-if="offer">
      <fieldset class="purchase-options__choices" :aria-label="$t('product_subscriptions.purchase_options.title')">
        <div class="purchase-options__choice" :class="{ 'purchase-options__choice--active': mode === 'once' }">
          <VcRadioButton
            v-model="mode"
            value="once"
            name="purchase-mode"
            size="sm"
            class="purchase-options__radio"
            data-test-id="purchase-option-once"
          >
            <span class="purchase-options__choice-body">
              <span class="purchase-options__choice-title">{{
                $t("product_subscriptions.purchase_options.one_time")
              }}</span>

              <span class="purchase-options__choice-price">{{ formatMoney(basePrice, currency) }}</span>
            </span>
          </VcRadioButton>
        </div>

        <div class="purchase-options__choice" :class="{ 'purchase-options__choice--active': mode === 'subscribe' }">
          <VcRadioButton
            v-model="mode"
            value="subscribe"
            name="purchase-mode"
            size="sm"
            class="purchase-options__radio"
            data-test-id="purchase-option-subscribe"
          >
            <span class="purchase-options__choice-body">
              <span class="purchase-options__choice-title">
                {{ $t("product_subscriptions.purchase_options.subscribe") }}
                <VcBadge v-if="savings" color="success" size="sm" variant="soft" rounded>{{ savings }}</VcBadge>
              </span>

              <span class="purchase-options__choice-price">
                {{ formatMoney(subscribePrice, currency) }}
                <s v-if="subscribePrice < basePrice" class="purchase-options__strike">{{
                  formatMoney(basePrice, currency)
                }}</s>
              </span>
            </span>
          </VcRadioButton>
        </div>
      </fieldset>

      <div v-if="mode === 'subscribe'" class="purchase-options__subscribe">
        <VcSelect
          v-model="selectedInterval"
          :label="$t('product_subscriptions.purchase_options.deliver')"
          :items="intervalItems"
          text-field="label"
          value-field="key"
          size="sm"
          data-test-id="purchase-option-frequency"
        />

        <ul class="purchase-options__benefits">
          <li><VcIcon name="check" size="xs" /> {{ $t("product_subscriptions.purchase_options.benefit_reminder") }}</li>

          <li><VcIcon name="check" size="xs" /> {{ $t("product_subscriptions.purchase_options.benefit_cancel") }}</li>
        </ul>

        <VcAlert v-if="!isAuthenticated" color="info" size="sm" variant="soft" icon>
          {{ $t("product_subscriptions.purchase_options.sign_in_required") }}
        </VcAlert>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, toRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useUser } from "@/shared/account/composables/useUser";
import { useShortCart } from "@/shared/cart/composables";
import { useCartSubscriptions } from "../composables/useCartSubscriptions";
import { useSubscriptionOffers } from "../composables/useSubscriptionOffers";
import {
  applyDiscount,
  discountLabel,
  errorMessage,
  formatMoney,
  intervalKey,
  intervalLabel,
  parseIntervalKey,
} from "../utils";
import type { Product } from "@/core/api/graphql/types";
import AddToCartSimple from "@/shared/cart/components/add-to-cart-simple.vue";
import CountInCart from "@/shared/catalog/components/count-in-cart.vue";
import InStock from "@/shared/catalog/components/in-stock.vue";

interface IProps {
  product: Product;
}

const props = defineProps<IProps>();
const product = toRef(props, "product");

const { t } = useI18n();
const { isAuthenticated } = useUser();
const { cart } = useShortCart();
const { loadOffers, getOffer } = useSubscriptionOffers();
const { byLineItemId, setSubscription, removeSubscription } = useCartSubscriptions();

const offer = getOffer(product.value.id);
const mode = ref<"once" | "subscribe">("once");
const selectedInterval = ref<string>();
const syncState = ref<"ok" | "saving" | "error">();
const syncError = ref<string>();

const currency = computed(() => product.value.price?.actual?.currency?.code);
const basePrice = computed(() => product.value.price?.actual?.amount ?? 0);
const subscribePrice = computed(() =>
  applyDiscount(basePrice.value, offer.value?.discountType, offer.value?.discountValue),
);
const savings = computed(() => discountLabel(t, offer.value?.discountType, offer.value?.discountValue, currency.value));

const intervalItems = computed(() =>
  (offer.value?.intervals ?? []).map((x) => ({
    key: intervalKey(x.unit, x.count),
    label: intervalLabel(t, x.unit, x.count),
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

    const defaultInterval = value.intervals.find((x) => x.isDefault) ?? value.intervals[0];
    selectedInterval.value ??= defaultInterval ? intervalKey(defaultInterval.unit, defaultInterval.count) : undefined;
  },
  { immediate: true },
);

// Reflect what is already in the cart when the page opens.
watch(
  activeSubscription,
  (value) => {
    if (value) {
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
      if (current && current.intervalUnit === unit && current.intervalCount === count) {
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
    syncError.value = errorMessage(e, t("product_subscriptions.errors.generic"));
  }
}

// The core add-to-cart creates the line; the choice is applied to it as soon as it exists or changes.
watch([() => lineItem.value?.id, mode, selectedInterval], () => void syncCartLine());

onMounted(() => {
  void loadOffers([product.value.id]);
});
</script>

<style lang="scss">
.purchase-options {
  @apply flex flex-col gap-3;

  &__choices {
    @apply flex flex-col gap-2 border-0 p-0 m-0;
  }

  &__choice {
    @apply rounded-lg border border-neutral-200 bg-additional-50 transition-colors;

    &:hover {
      @apply border-primary-300;
    }

    &--active {
      @apply border-primary bg-primary-50;
    }
  }

  // the radio's own label fills the card, so the whole card selects the option
  &__radio {
    @apply w-full;

    .vc-radio-button__container {
      @apply w-full items-start gap-3 p-3;
    }

    .vc-radio-button__label {
      @apply flex min-w-0 grow;
    }
  }

  &__choice-body {
    @apply flex min-w-0 grow flex-wrap items-center justify-between gap-x-3 gap-y-1;
  }

  &__choice-title {
    @apply flex items-center gap-2 text-sm font-bold text-neutral-900;
  }

  &__choice-price {
    @apply text-sm font-bold text-neutral-900;
  }

  &__strike {
    @apply ml-1 text-xs font-normal text-neutral-500;
  }

  &__subscribe {
    @apply flex flex-col gap-3 rounded-lg bg-neutral-50 p-3;
  }

  &__benefits {
    @apply flex flex-col gap-1 text-xs text-neutral-700;

    li {
      @apply flex items-center gap-1.5;
    }
  }

  &__status {
    @apply flex items-center gap-1.5 text-xs text-success-700;

    &--error {
      @apply text-danger;
    }
  }
}
</style>
