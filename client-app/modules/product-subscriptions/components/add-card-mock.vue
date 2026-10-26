<template>
  <div class="add-card-mock">
    <VcAlert color="warning" size="sm" variant="soft" icon class="mb-4">{{
      $t("product_subscriptions.mock_payment.banner")
    }}</VcAlert>

    <BankCardForm
      :key="cardFormKey"
      v-model="card"
      v-model:valid="cardValid"
      :disabled="adding"
      class="xl:w-2/3"
      @submit="addCard(false)"
    />

    <div class="mt-3 flex flex-wrap gap-2">
      <VcButton
        v-for="testCard in MOCK_TEST_CARDS"
        :key="testCard.number"
        size="xs"
        variant="outline"
        color="neutral"
        @click="useTestCard(testCard.number)"
      >
        <span class="add-card-mock__chip-number">•••• {{ testCard.number.slice(-4) }}</span>

        <span>{{ $t(`product_subscriptions.mock_payment.cards.${testCard.key}`) }}</span>
      </VcButton>
    </div>

    <VcAlert v-if="addError" color="danger" size="sm" variant="soft" icon class="mt-3" role="alert">{{
      addError
    }}</VcAlert>

    <VcButton
      class="mt-4"
      :disabled="!cardValid"
      :loading="adding"
      data-test-id="saved-card-add"
      @click="addCard(false)"
    >
      {{ $t("shared.payment.saved_cards.add") }}
    </VcButton>

    <VcModal
      :show="showThreeDs"
      :title="$t('product_subscriptions.mock_payment.three_ds_title')"
      icon="shield-check"
      is-persistent
      hide-actions
      max-width="26rem"
      @close="showThreeDs = false"
    >
      <div class="flex flex-col items-center gap-3 text-center">
        <VcIcon name="lock" size="lg" class="text-primary" />

        <p class="text-sm">{{ $t("product_subscriptions.mock_payment.three_ds_verify_card") }}</p>

        <div class="flex w-full flex-col gap-2 sm:flex-row">
          <VcButton variant="outline" color="neutral" full-width @click="showThreeDs = false">{{
            $t("product_subscriptions.mock_payment.three_ds_decline")
          }}</VcButton>

          <VcButton full-width @click="addCard(true)">{{
            $t("product_subscriptions.mock_payment.three_ds_approve")
          }}</VcButton>
        </div>
      </div>
    </VcModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { globals } from "@/core/globals";
import { addSavedPaymentMethod } from "@/shared/payment/api/graphql";
import { MOCK_PAYMENT_CODE, MOCK_TEST_CARDS } from "../constants";
import { subscriptionErrorMessage } from "../utils";
import type { BankCardType } from "@/shared/payment";
import BankCardForm from "@/shared/payment/components/bank-card-form.vue";

interface IProps {
  paymentMethodCode?: string;
  setDefault: boolean;
}

interface IEmits {
  (event: "added"): void;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();
const { t } = useI18n();

const adding = ref(false);
const addError = ref<string>();
const showThreeDs = ref(false);
const cardValid = ref(false);
// BankCardForm reads its model only on mount, so a filled-in test card re-mounts it.
const cardFormKey = ref(0);
const card = ref<BankCardType>({ cardholderName: "", number: "", month: "", year: "", securityCode: "" });

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

async function addCard(threeDsCompleted: boolean) {
  showThreeDs.value = false;
  adding.value = true;
  addError.value = undefined;

  const digits = card.value.number.replace(/\D/g, "");
  try {
    await addSavedPaymentMethod({
      storeId: globals.storeId ?? "",
      paymentMethodCode: MOCK_PAYMENT_CODE,
      setDefault: props.setDefault,
      parameters: [
        { key: "last4", value: digits.slice(-4) },
        { key: "firstDigit", value: digits.charAt(0) },
        { key: "expMonth", value: card.value.month },
        { key: "expYear", value: card.value.year },
        { key: "cardholderName", value: card.value.cardholderName },
        { key: "threeDsCompleted", value: String(threeDsCompleted) },
      ],
    });

    card.value = { cardholderName: "", number: "", month: "", year: "", securityCode: "" };
    cardFormKey.value++;
    emit("added");
  } catch (e) {
    const code = (e as { graphQLErrors?: { extensions?: { code?: string } }[] })?.graphQLErrors?.[0]?.extensions?.code;
    if (code === "AUTHENTICATION_REQUIRED" && !threeDsCompleted) {
      showThreeDs.value = true;
    } else {
      addError.value = subscriptionErrorMessage(e, t);
    }
  } finally {
    adding.value = false;
  }
}
</script>

<style lang="scss">
.add-card-mock {
  &__chip-number {
    @apply me-1 font-mono;
  }
}
</style>
