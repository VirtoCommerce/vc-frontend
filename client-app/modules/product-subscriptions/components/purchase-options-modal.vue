<template>
  <VcModal
    class="purchase-options-modal"
    :title="$t('product_subscriptions.purchase_options.title')"
    max-width="36rem"
    is-mobile-fullscreen
    dividers
    test-id="purchase-options-modal"
  >
    <template #default="{ close }">
      <div class="purchase-options-modal__body">
        <p class="purchase-options-modal__product">{{ productName }}</p>

        <fieldset
          class="purchase-options-modal__choices"
          :aria-label="$t('product_subscriptions.purchase_options.title')"
        >
          <PurchaseOption
            v-model="mode"
            value="once"
            name="purchase-options-modal-mode"
            :disabled="saving"
            test-id="purchase-options-modal-once"
          >
            <template #title>{{ $t("product_subscriptions.purchase_options.one_time") }}</template>
          </PurchaseOption>

          <PurchaseOption
            v-model="mode"
            value="subscribe"
            name="purchase-options-modal-mode"
            :disabled="saving"
            test-id="purchase-options-modal-subscribe"
          >
            <template #title>{{ $t("product_subscriptions.purchase_options.subscribe") }}</template>

            <SubscriptionFrequencyPicker
              v-model="selectedKey"
              :intervals="offer.intervals"
              name="purchase-options-modal-frequency"
              :disabled="saving"
              test-id="purchase-options-modal-frequency"
            />

            <SubscriptionBenefits />

            <!-- In a new tab: the dialog would stay open over the page, and the choice is not saved yet. -->
            <HowItWorksLink new-tab test-id="purchase-options-modal-how-it-works-link" />
          </PurchaseOption>
        </fieldset>

        <div v-if="onPause || onCancel" class="purchase-options-modal__manage">
          <VcButton
            v-if="onPause"
            size="sm"
            variant="ghost"
            color="secondary"
            prepend-icon="pause"
            :disabled="saving"
            data-test-id="purchase-options-modal-pause"
            @click="run(onPause, close)"
          >
            {{ $t("product_subscriptions.deliveries.pause") }}
          </VcButton>

          <VcButton
            v-if="onCancel"
            size="sm"
            variant="ghost"
            color="danger"
            prepend-icon="circle-x"
            :disabled="saving"
            data-test-id="purchase-options-modal-cancel-subscription"
            @click="run(onCancel, close)"
          >
            {{ $t("product_subscriptions.deliveries.cancel") }}
          </VcButton>
        </div>

        <VcAlert v-if="error" color="danger" size="sm" variant="soft" icon role="alert">
          {{ error }}
        </VcAlert>
      </div>
    </template>

    <template #actions="{ close }">
      <VcButton color="secondary" variant="outline" :disabled="saving" @click="close">
        {{ $t("product_subscriptions.purchase_options.cancel") }}
      </VcButton>

      <VcButton
        class="purchase-options-modal__save"
        :loading="saving"
        data-test-id="purchase-options-modal-save"
        @click="save(close)"
      >
        {{ $t("product_subscriptions.purchase_options.save") }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { intervalKey, subscriptionErrorMessage } from "../utils";
import HowItWorksLink from "./how-it-works-link.vue";
import PurchaseOption from "./purchase-option.vue";
import SubscriptionBenefits from "./subscription-benefits.vue";
import SubscriptionFrequencyPicker from "./subscription-frequency-picker.vue";
import type { SubscriptionOfferType } from "../composables/useSubscriptionOffers";

interface IProps {
  productName?: string;
  offer: SubscriptionOfferType;
  /** The line's current interval key; none when the line is a one-time purchase. */
  currentKey?: string;
  /** Applies the choice: an interval key to subscribe, `undefined` for a one-time purchase. Rejects on failure. */
  onSave: (key: string | undefined) => Promise<void>;
  /** For a running subscription (Account › Subscriptions): pauses this product's subscription, after its own confirmation. */
  onPause?: () => void;
  /** For a running subscription: cancels this product's subscription, after its own confirmation. */
  onCancel?: () => void;
}

const props = defineProps<IProps>();

const { t } = useI18n();

// Opened from "Subscribe" the subscription is preselected; from "Change" it shows the line's choice.
const mode = ref<"once" | "subscribe">("subscribe");
const selectedKey = ref(initialKey());
const saving = ref(false);
const error = ref<string>();

function initialKey(): string | undefined {
  if (props.currentKey) {
    return props.currentKey;
  }

  const defaultInterval = props.offer.intervals.find((x) => x.isDefault) ?? props.offer.intervals[0];
  return defaultInterval ? intervalKey(defaultInterval.unit, defaultInterval.count) : undefined;
}

/** Pause / cancel lead to their own confirmation dialog, so this one closes first. */
function run(action: () => void, close: () => void): void {
  close();
  action();
}

async function save(close: () => void): Promise<void> {
  saving.value = true;
  error.value = undefined;
  try {
    await props.onSave(mode.value === "subscribe" ? selectedKey.value : undefined);
    close();
  } catch (e) {
    error.value = subscriptionErrorMessage(e, t);
  } finally {
    saving.value = false;
  }
}
</script>

<style lang="scss">
.purchase-options-modal {
  &__body {
    @apply flex flex-col gap-4;
  }

  &__product {
    @apply text-base text-neutral-800;
  }

  &__choices {
    @apply flex flex-col gap-2;
  }

  &__manage {
    @apply flex flex-wrap gap-2 border-t border-neutral-200 pt-3;
  }

  &__save {
    @apply ms-auto;
  }
}
</style>
