<template>
  <div class="mock-card-payment" data-test-id="mock-card-payment">
    <VcAlert color="warning" size="sm" variant="soft" icon class="mock-card-payment__banner">
      {{ $t("product_subscriptions.mock_payment.banner") }}
    </VcAlert>

    <VcAlert v-if="initError" color="danger" size="sm" variant="soft" icon>{{ initError }}</VcAlert>

    <template v-else>
      <SavedCardPicker v-model="selected" :methods="savedMethods" :new-card-value="NEW_CARD" name="mock-card" />

      <div v-if="selected === NEW_CARD" class="mock-card-payment__new">
        <BankCardForm
          :key="cardFormKey"
          v-model="card"
          v-model:valid="cardValid"
          :disabled="loading"
          class="mock-card-payment__card-form"
          @submit="pay"
        />

        <div class="mock-card-payment__test-cards">
          <span class="mock-card-payment__test-cards-title">{{
            $t("product_subscriptions.mock_payment.test_cards")
          }}</span>

          <div class="mock-card-payment__chips">
            <VcButton
              v-for="testCard in MOCK_TEST_CARDS"
              :key="testCard.number"
              size="xs"
              variant="outline"
              color="neutral"
              :data-test-id="`mock-test-card-${testCard.key}`"
              @click="useTestCard(testCard.number)"
            >
              <span class="mock-card-payment__chip-number">•••• {{ testCard.number.slice(-4) }}</span>

              <span>{{ $t(`product_subscriptions.mock_payment.cards.${testCard.key}`) }}</span>
            </VcButton>
          </div>
        </div>

        <VcCheckbox
          v-model="saveCard"
          :disabled="requiresSavedCard || loading"
          class="mock-card-payment__save-card"
          test-id="mock-card-save"
        >
          {{ $t("product_subscriptions.mock_payment.save_card") }}
        </VcCheckbox>

        <p v-if="requiresSavedCard" class="mock-card-payment__note">
          {{ $t("product_subscriptions.mock_payment.save_card_required") }}
        </p>
      </div>

      <VcAlert
        v-if="paymentError"
        color="danger"
        size="sm"
        variant="soft"
        icon
        class="mock-card-payment__error"
        role="alert"
        >{{ paymentError }}</VcAlert
      >

      <VcButton
        class="mock-card-payment__pay"
        :loading="loading"
        :disabled="!canPay"
        min-width="12rem"
        data-test-id="mock-card-pay"
        @click="pay"
      >
        {{
          $t("product_subscriptions.mock_payment.pay", {
            amount: formatMoney(order.total?.amount, order.currency?.code),
          })
        }}
      </VcButton>
    </template>

    <ThreeDsModal
      :show="showThreeDs"
      :message="
        $t('product_subscriptions.mock_payment.three_ds_text', {
          amount: formatMoney(order.total?.amount, order.currency?.code),
        })
      "
      @decline="decline3ds"
      @approve="approve3ds"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, toRef } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { authorizePayment, initializePayment } from "@/core/api/graphql";
import { Logger } from "@/core/utilities";
import { useCardSavingRequirement } from "@/shared/payment/composables/useCardSavingRequirement";
import { useSavedPaymentMethods } from "@/shared/payment/composables/useSavedPaymentMethods";
import { MOCK_PAYMENT_CODE, MOCK_TEST_CARDS, THREE_DS_ON_RENEWAL_LAST4, THREE_DS_ON_SAVE_LAST4 } from "../constants";
import { formatMoney } from "../utils";
import ThreeDsModal from "./three-ds-modal.vue";
import type { CustomerOrderType } from "@/core/api/graphql/types";
import type { BankCardType } from "@/shared/payment";
import BankCardForm from "@/shared/payment/components/bank-card-form.vue";
import SavedCardPicker from "@/shared/payment/components/saved-card-picker.vue";

interface IProps {
  order: CustomerOrderType;
  paymentTypeName?: string;
}

interface IEmits {
  (event: "success"): void;
  (event: "fail"): void;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();
const NEW_CARD = "new";

const order = toRef(props, "order");

const { t } = useI18n();
const route = useRoute();
const { methodsFor, fetch: fetchSavedMethods } = useSavedPaymentMethods();
const cardSaving = useCardSavingRequirement();

const loading = ref(false);
const initError = ref<string>();
const paymentError = ref<string>();
const selected = ref<string>(NEW_CARD);
const card = ref<BankCardType>({ cardholderName: "", number: "", month: "", year: "", securityCode: "" });
const cardValid = ref(false);
// BankCardForm reads its model only on mount, so a filled-in test card re-mounts it.
const cardFormKey = ref(0);
const saveCard = ref(true);
const showThreeDs = ref(false);

// Only for an order placed from the cart whose subscription terms were accepted: the requirement is matched by the
// order's shoppingCartId.
const subscriptionCheckout = cardSaving.read({ order: order.value });
const requiresSavedCard = computed(() => !!subscriptionCheckout);

const savedMethods = computed(() => methodsFor(MOCK_PAYMENT_CODE));
const payment = computed(() => order.value.inPayments?.[0]);
const canPay = computed(() => !loading.value && !!payment.value && (selected.value !== NEW_CARD || cardValid.value));

function useTestCard(number: string) {
  card.value = {
    ...card.value,
    number,
    cardholderName: card.value.cardholderName || "Test Customer",
    month: card.value.month || "12",
    year: card.value.year || String((new Date().getFullYear() + 3) % 100).padStart(2, "0"),
    securityCode: card.value.securityCode || "123",
  };
  cardFormKey.value++;
}

function selectedLast4(): string | undefined {
  if (selected.value !== NEW_CARD) {
    return savedMethods.value.find((x) => x.id === selected.value)?.last4 ?? undefined;
  }

  return card.value.number.replace(/\D/g, "").slice(-4);
}

// Mirrors the mock provider: it challenges 3220 on every customer-present payment, and a saved 3184 as well.
function needs3ds(): boolean {
  const last4 = selectedLast4();
  return last4 === THREE_DS_ON_SAVE_LAST4 || (selected.value !== NEW_CARD && last4 === THREE_DS_ON_RENEWAL_LAST4);
}

function buildParameters(threeDsCompleted: boolean): { key: string; value: string }[] {
  if (selected.value !== NEW_CARD) {
    return [
      { key: "storedPaymentMethodId", value: selected.value },
      { key: "threeDsCompleted", value: String(threeDsCompleted) },
    ];
  }

  const digits = card.value.number.replace(/\D/g, "");
  return [
    { key: "last4", value: digits.slice(-4) },
    { key: "firstDigit", value: digits.charAt(0) },
    { key: "expMonth", value: card.value.month },
    { key: "expYear", value: card.value.year },
    { key: "cardholderName", value: card.value.cardholderName },
    { key: "storeForFutureUse", value: String(saveCard.value || requiresSavedCard.value) },
    { key: "consentId", value: subscriptionCheckout?.consentId ?? "" },
    { key: "threeDsCompleted", value: String(threeDsCompleted) },
  ];
}

async function authorize(threeDsCompleted: boolean): Promise<void> {
  if (!payment.value) {
    return;
  }

  loading.value = true;
  paymentError.value = undefined;

  try {
    const result = await authorizePayment({
      orderId: order.value.id,
      paymentId: payment.value.id,
      parameters: buildParameters(threeDsCompleted),
    });

    if (result.isSuccess) {
      cardSaving.clear();
      emit("success");
      return;
    }

    // The provider's reason is in English and meant for logs; the customer gets a translated message.
    Logger.warn("mock-card-payment.authorize", result.errorMessage);
    paymentError.value = t("product_subscriptions.mock_payment.declined");
  } catch (e) {
    Logger.error("mock-card-payment.authorize", e);
    paymentError.value = t("product_subscriptions.errors.generic");
  } finally {
    loading.value = false;
  }
}

function pay() {
  if (!canPay.value) {
    return;
  }

  if (needs3ds()) {
    showThreeDs.value = true;
    return;
  }

  void authorize(false);
}

function approve3ds() {
  showThreeDs.value = false;
  void authorize(true);
}

function decline3ds() {
  showThreeDs.value = false;
  paymentError.value = t("product_subscriptions.mock_payment.three_ds_failed");
}

onMounted(async () => {
  void fetchSavedMethods().then(() => {
    // A renewal link names the card the bank challenged, so the customer confirms with that card.
    const requested = typeof route.query.card === "string" ? route.query.card : undefined;
    const preferred =
      savedMethods.value.find((x) => x.id === requested) ??
      savedMethods.value.find((x) => x.isDefault) ??
      savedMethods.value[0];
    if (preferred) {
      selected.value = preferred.id;
    }
  });

  if (!payment.value) {
    initError.value = t("product_subscriptions.errors.generic");
    return;
  }

  try {
    const result = await initializePayment({ orderId: order.value.id, paymentId: payment.value.id });
    if (!result.isSuccess) {
      Logger.warn("mock-card-payment.initialize", result.errorMessage);
      initError.value = t("product_subscriptions.errors.generic");
    }
  } catch (e) {
    Logger.error("mock-card-payment.initialize", e);
    initError.value = t("product_subscriptions.errors.generic");
  }
});
</script>

<style lang="scss">
.mock-card-payment {
  &__banner {
    @apply mb-4;
  }

  &__card-form {
    @media (width >= theme("screens.xl")) {
      @apply w-2/3;
    }
  }

  &__test-cards {
    @apply mt-4 flex flex-col gap-2;
  }

  &__test-cards-title {
    @apply text-xs font-bold text-neutral-600;
  }

  &__save-card {
    @apply mt-4;
  }

  &__note {
    @apply mt-1 text-xs text-neutral-600;
  }

  &__error {
    @apply mt-4;
  }

  &__pay {
    @apply mt-5;
  }

  &__chips {
    @apply flex flex-wrap gap-2;
  }

  &__chip-number {
    @apply me-1 font-mono;
  }
}
</style>
