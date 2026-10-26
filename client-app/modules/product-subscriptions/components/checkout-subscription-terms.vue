<template>
  <VcWidget
    v-if="hasSubscriptionItems"
    :title="$t('product_subscriptions.checkout.title')"
    prepend-icon="refresh"
    size="lg"
    class="checkout-subscription-terms"
    data-test-id="checkout-subscription-terms"
  >
    <ul class="checkout-subscription-terms__items">
      <li v-for="item in subscribedLines" :key="item.lineItemId">
        <strong>{{ item.name }}</strong>

        <span class="checkout-subscription-terms__interval">{{
          intervalLabel($t, item.intervalUnit, item.intervalCount)
        }}</span>
      </li>
    </ul>

    <div class="checkout-subscription-terms__text">
      <VcLoader v-if="!terms" size="sm" />

      <p v-else>{{ terms.text }}</p>
    </div>

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

    <VcAlert v-if="error" color="danger" size="sm" variant="soft" icon class="mt-3">{{ error }}</VcAlert>
  </VcWidget>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { useCheckoutGuards } from "@/shared/checkout/composables/useCheckoutGuards";
import { useCardSavingRequirement } from "@/shared/payment/composables/useCardSavingRequirement";
import { acceptSubscriptionTerms, getSubscriptionTerms } from "../api/graphql";
import { useCartSubscriptions } from "../composables/useCartSubscriptions";
import { errorMessage, intervalLabel } from "../utils";
import type { GetSubscriptionTermsQuery } from "../api/graphql/types";
import type { CartType } from "@/core/api/graphql/types";

const props = defineProps<{ cart?: CartType }>();

const GUARD_ID = "product-subscription-terms";

const { t } = useI18n();
const cart = computed(() => props.cart);
const { items, hasSubscriptionItems, refresh } = useCartSubscriptions();
const { registerGuard, unregisterGuard } = useCheckoutGuards();
// Subscriptions are paid with the checkout's card, so accepting the terms makes the card form save it with the consent.
const cardSaving = useCardSavingRequirement();

const terms = ref<GetSubscriptionTermsQuery["subscriptionTerms"]>();
const accepted = ref(false);
const saving = ref(false);
const error = ref<string>();

const subscribedLines = computed(() => {
  const lines = new Map((cart.value?.items ?? []).map((x) => [x.id, x]));
  return items.value.filter((x) => lines.has(x.lineItemId)).map((x) => ({ ...x, name: lines.get(x.lineItemId)?.name }));
});

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
    cardSaving.require(consentId);
  } catch (e) {
    accepted.value = false;
    error.value = errorMessage(e, t("product_subscriptions.errors.generic"));
  } finally {
    saving.value = false;
  }
}

watch(
  hasSubscriptionItems,
  (has) => {
    if (has) {
      registerGuard(GUARD_ID, { canPlaceOrder: () => accepted.value });
    } else {
      unregisterGuard(GUARD_ID);
    }
  },
  { immediate: true },
);

onMounted(async () => {
  void refresh();
  try {
    terms.value = await getSubscriptionTerms();
  } catch (e) {
    Logger.error("checkout-subscription-terms", e);
  }
});

onUnmounted(() => unregisterGuard(GUARD_ID));
</script>

<style lang="scss">
.checkout-subscription-terms {
  @apply mt-5;

  &__items {
    @apply mb-3 flex flex-col gap-1 text-sm text-neutral-800;

    li {
      @apply flex flex-col sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-2;
    }
  }

  &__interval {
    @apply text-neutral-600;

    // The separator only makes sense on one line; on phones the frequency goes below the name.
    &::before {
      @apply hidden sm:mr-2 sm:inline sm:content-['·'];
    }
  }

  &__text {
    @apply mb-4 rounded-md bg-neutral-50 p-3 text-sm leading-relaxed text-neutral-800;
  }

  &__required {
    @apply mt-2 text-xs text-warning-700;
  }
}
</style>
