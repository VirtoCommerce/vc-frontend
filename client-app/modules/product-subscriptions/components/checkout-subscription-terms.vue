<template>
  <VcWidget
    v-if="hasSubscriptionItems || failed"
    :title="$t('product_subscriptions.checkout.title')"
    prepend-icon="refresh"
    size="lg"
    class="checkout-subscription-terms"
    data-test-id="checkout-subscription-terms"
  >
    <VcAlert v-if="failed" color="danger" size="sm" variant="soft" icon>
      {{ $t("product_subscriptions.checkout.items_failed") }}

      <VcButton size="xs" variant="outline" class="checkout-subscription-terms__retry" @click="refresh">
        {{ $t("product_subscriptions.checkout.retry") }}
      </VcButton>
    </VcAlert>

    <template v-else>
      <VcAlert
        v-if="showNoPaymentMethod"
        color="warning"
        size="sm"
        variant="soft"
        icon
        class="checkout-subscription-terms__notice"
        data-test-id="checkout-subscription-no-payment-method"
      >
        {{ $t("product_subscriptions.checkout.no_payment_method") }}
      </VcAlert>

      <VcLineItems :items="subscribedLines" with-image class="checkout-subscription-terms__items">
        <template #titles>
          <div class="checkout-subscription-terms__interval-title">
            {{ $t("product_subscriptions.checkout.deliver_every") }}
          </div>
        </template>

        <template #default="{ item }">
          <span class="checkout-subscription-terms__interval">{{ intervalOf(item.id) }}</span>
        </template>
      </VcLineItems>

      <VcAlert
        v-if="termsFailed"
        color="danger"
        size="sm"
        variant="soft"
        icon
        class="checkout-subscription-terms__text"
      >
        {{ $t("product_subscriptions.checkout.terms_failed") }}

        <VcButton size="xs" variant="outline" class="checkout-subscription-terms__retry" @click="loadTerms">
          {{ $t("product_subscriptions.checkout.retry") }}
        </VcButton>
      </VcAlert>

      <VcLoader v-else-if="!terms" size="sm" class="checkout-subscription-terms__text" />

      <!-- The store's terms are Markdown (bold lead-ins, one paragraph per topic); the consent covers exactly this text. -->
      <VcAlert
        v-else
        color="info"
        size="sm"
        variant="outline"
        icon
        class="checkout-subscription-terms__text"
        data-test-id="checkout-subscription-terms-text"
      >
        <VcMarkdownRender :src="terms.text" />
      </VcAlert>

      <VcCheckbox
        :model-value="accepted"
        :disabled="saving || !terms"
        test-id="checkout-subscription-terms-checkbox"
        @update:model-value="onToggle"
      >
        {{ $t("product_subscriptions.checkout.agree") }}
      </VcCheckbox>

      <p v-if="!accepted" class="checkout-subscription-terms__required">
        {{ $t("product_subscriptions.checkout.required") }}
      </p>

      <VcAlert v-if="error" color="danger" size="sm" variant="soft" icon class="checkout-subscription-terms__error">{{
        error
      }}</VcAlert>
    </template>
  </VcWidget>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { globals } from "@/core/globals";
import { Logger, prepareLineItem } from "@/core/utilities";
import { useFullCart } from "@/shared/cart/composables";
import { useOrderPlacement } from "@/shared/checkout/composables/useCheckout";
import { useCardSavingRequirement } from "@/shared/payment/composables/useCardSavingRequirement";
import { acceptSubscriptionTerms, getSubscriptionTerms } from "../api/graphql";
import { useSubscriptionCheckout } from "../composables/useSubscriptionCheckout";
import { intervalShortLabel, needsCardPaymentMethodNotice, subscriptionErrorMessage } from "../utils";
import type { GetSubscriptionTermsQuery } from "../api/graphql/types";
import type { CartType } from "@/core/api/graphql/types";
import type { PreparedLineItemType } from "@/core/types";

const props = defineProps<{ cart?: CartType }>();

const { t } = useI18n();
const cart = computed(() => props.cart);
// Shared with the checkout guard the module registers at start-up: it reads this cart and the accepted flag.
const checkout = useSubscriptionCheckout();
const { accepted } = checkout;
const { subscribedItems, hasSubscriptionItems, failed, refresh } = checkout.subscriptions;
// The payment list only offers methods that can save a card for a subscription cart; when none can, say why it's empty.
const { availablePaymentMethods } = useFullCart();
const showNoPaymentMethod = computed(() =>
  needsCardPaymentMethodNotice(hasSubscriptionItems.value, availablePaymentMethods.value),
);
// Subscriptions are paid with the checkout's card, so accepting the terms makes the card form save it with the consent.
const cardSaving = useCardSavingRequirement();
const { placingOrder } = useOrderPlacement();

const terms = ref<GetSubscriptionTermsQuery["subscriptionTerms"]>();
const termsFailed = ref(false);
const saving = ref(false);
const error = ref<string>();

const subscribedLines = computed<PreparedLineItemType[]>(() => {
  const lines = new Map((cart.value?.items ?? []).map((x) => [x.id, x]));
  return subscribedItems.value.flatMap((x) => {
    const line = lines.get(x.lineItemId);
    return line ? [prepareLineItem(line)] : [];
  });
});

const intervalsByLineId = computed(
  () =>
    new Map(subscribedItems.value.map((x) => [x.lineItemId, intervalShortLabel(t, x.intervalUnit, x.intervalCount)])),
);

function intervalOf(lineItemId: string): string {
  return intervalsByLineId.value.get(lineItemId) ?? "";
}

async function loadTerms(): Promise<void> {
  termsFailed.value = false;
  try {
    terms.value = await getSubscriptionTerms();
  } catch (e) {
    Logger.error("checkout-subscription-terms.loadTerms", e);
    termsFailed.value = true;
  }
}

async function onToggle(value: boolean) {
  error.value = undefined;

  if (!value) {
    accepted.value = false;
    cardSaving.clear();
    return;
  }

  if (!terms.value || !cart.value?.id || !globals.storeId) {
    return;
  }

  saving.value = true;
  try {
    const consentId = await acceptSubscriptionTerms({
      storeId: globals.storeId,
      cartId: cart.value.id,
      termsVersion: terms.value.version,
      termsHash: terms.value.hash,
    });

    accepted.value = true;
    cardSaving.require(consentId, cart.value.id);
  } catch (e) {
    accepted.value = false;
    error.value = subscriptionErrorMessage(e, t);
  } finally {
    saving.value = false;
  }
}

// The stored consent lives only as long as this checkbox is ticked. The one exception is an order being placed: placing
// it refetches the cart (no subscribed lines left) and leaves the page, and its payment form still reads the consent.
function withdrawConsent(): void {
  accepted.value = false;
  if (!placingOrder.value) {
    cardSaving.clear();
  }
}

watch(hasSubscriptionItems, (hasItems) => {
  if (!hasItems) {
    withdrawConsent();
  }
});

// The guard reviews the cart this block shows: the order waits until its subscriptions are known, and the terms are
// accepted when there are any. A failed load keeps it blocked until the retry succeeds.
watch(cart, (value) => (checkout.cart.value = value), { immediate: true });

onMounted(() => {
  // The checkbox starts unticked, so a consent stored earlier (e.g. before going back to the cart) no longer applies.
  accepted.value = false;
  cardSaving.clear();
  void refresh();
  void loadTerms();
});

onUnmounted(() => {
  checkout.cart.value = undefined;
  withdrawConsent();
});
</script>

<style lang="scss">
.checkout-subscription-terms {
  @apply mt-5;

  &__items {
    @apply mb-4;
  }

  &__interval-title {
    @apply whitespace-nowrap text-center;
  }

  // The kit sizes the column by its cells: wide enough for the heading, so it stays on one line.
  &__interval {
    @apply block min-w-28 text-center text-sm text-neutral-900;
  }

  &__text {
    @apply mb-4;
  }

  &__required {
    @apply mt-2 text-xs text-warning-700;
  }

  &__retry {
    @apply mt-2;
  }

  &__notice {
    @apply mb-3;
  }

  &__error {
    @apply mt-3;
  }
}
</style>
