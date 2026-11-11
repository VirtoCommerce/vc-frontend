<template>
  <div class="add-card-mock">
    <VcAlert color="warning" size="sm" variant="soft" icon class="add-card-mock__banner">{{
      $t("product_subscriptions.mock_payment.banner")
    }}</VcAlert>

    <BankCardForm
      :key="cardFormKey"
      v-model="card"
      v-model:valid="cardValid"
      :disabled="adding"
      class="add-card-mock__card-form"
      @submit="addCard(false)"
    />

    <div class="add-card-mock__test-cards">
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

    <VcAlert v-if="addError" color="danger" size="sm" variant="soft" icon class="add-card-mock__error" role="alert">{{
      addError
    }}</VcAlert>

    <VcButton
      class="add-card-mock__submit"
      :disabled="!cardValid"
      :loading="adding"
      data-test-id="saved-card-add"
      @click="addCard(false)"
    >
      {{ $t("shared.payment.saved_cards.add") }}
    </VcButton>

    <ThreeDsModal
      :show="showThreeDs"
      :message="$t('product_subscriptions.mock_payment.three_ds_verify_card')"
      @decline="showThreeDs = false"
      @approve="addCard(true)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { globals } from "@/core/globals";
import { addSavedPaymentMethod } from "@/shared/payment/api/graphql";
import { MOCK_PAYMENT_CODE, MOCK_TEST_CARDS } from "../constants";
import { subscriptionErrorMessage } from "../utils";
import ThreeDsModal from "./three-ds-modal.vue";
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
  &__banner {
    @apply mb-4;
  }

  &__card-form {
    @media (width >= theme("screens.xl")) {
      @apply w-2/3;
    }
  }

  &__test-cards {
    @apply mt-3 flex flex-wrap gap-2;
  }

  &__chip-number {
    @apply me-1 font-mono;
  }

  &__error {
    @apply mt-3;
  }

  &__submit {
    @apply mt-4;
  }
}
</style>
