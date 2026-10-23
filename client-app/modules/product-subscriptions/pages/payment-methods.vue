<template>
  <div class="payment-methods-page">
    <div>
      <VcTypography tag="h1">{{ $t("product_subscriptions.payment_methods.title") }}</VcTypography>

      <p class="mt-1 text-sm text-neutral-600">{{ $t("product_subscriptions.payment_methods.subtitle") }}</p>
    </div>

    <VcWidget size="lg">
      <template #default-container>
        <VcLoaderOverlay v-if="loading && !loaded" />

        <VcEmptyView
          v-else-if="!visibleMethods.length"
          :text="$t('product_subscriptions.payment_methods.empty')"
          icon="credit-card"
          class="py-10"
        />

        <ul v-else class="payment-methods-page__list">
          <li
            v-for="method in visibleMethods"
            :key="method.id"
            class="saved-card"
            :data-test-id="`saved-card-${method.last4}`"
          >
            <div class="saved-card__icon"><VcIcon name="credit-card" size="md" /></div>

            <div class="saved-card__main">
              <div class="saved-card__title">
                {{ cardLabel(method.brand, method.last4) }}
                <VcBadge v-if="method.isDefault" size="sm" variant="soft" color="info" rounded>{{
                  $t("product_subscriptions.payment_methods.default")
                }}</VcBadge>

                <VcBadge v-if="method.isExpired" size="sm" variant="soft" color="danger" rounded>{{
                  $t("product_subscriptions.card_status.Expired")
                }}</VcBadge>

                <VcBadge v-else-if="method.status !== 'Active'" size="sm" variant="soft" color="warning" rounded>{{
                  $t(`product_subscriptions.card_status.${method.status}`, method.status)
                }}</VcBadge>
              </div>

              <div class="saved-card__meta">
                {{
                  $t("product_subscriptions.payment_methods.expires", {
                    date: `${method.expirationMonth}/${method.expirationYear}`,
                  })
                }}
                <template v-if="method.cardholderName"> · {{ method.cardholderName }}</template>
              </div>
            </div>

            <div class="saved-card__actions">
              <VcButton
                v-if="!method.isDefault && method.status === 'Active' && !method.isExpired"
                size="xs"
                variant="ghost"
                :loading="busy === `default-${method.id}`"
                @click="makeDefault(method.id)"
              >
                {{ $t("product_subscriptions.payment_methods.make_default") }}
              </VcButton>

              <VcButton
                size="xs"
                variant="ghost"
                color="danger"
                :data-test-id="`saved-card-remove-${method.last4}`"
                @click="toRemove = method.id"
              >
                {{ $t("product_subscriptions.payment_methods.remove") }}
              </VcButton>
            </div>
          </li>
        </ul>
      </template>
    </VcWidget>

    <VcWidget :title="$t('product_subscriptions.payment_methods.add_title')" prepend-icon="plus" size="lg">
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
        <button
          v-for="testCard in MOCK_TEST_CARDS"
          :key="testCard.number"
          type="button"
          class="payment-methods-page__chip"
          @click="useTestCard(testCard.number)"
        >
          <span class="font-mono">•••• {{ testCard.number.slice(-4) }}</span>

          <span>{{ $t(`product_subscriptions.mock_payment.cards.${testCard.key}`) }}</span>
        </button>
      </div>

      <VcCheckbox v-model="setAsDefault" class="mt-4">{{
        $t("product_subscriptions.payment_methods.set_default")
      }}</VcCheckbox>

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
        {{ $t("product_subscriptions.payment_methods.add") }}
      </VcButton>
    </VcWidget>

    <VcConfirmationModal
      v-if="toRemove"
      :title="$t('product_subscriptions.payment_methods.remove_title')"
      :text="$t('product_subscriptions.payment_methods.remove_text')"
      variant="danger"
      icon="trash"
      :loading="busy === 'remove'"
      @confirm="remove"
      @close="toRemove = undefined"
    />

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
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { globals } from "@/core/globals";
import { useNotifications } from "@/shared/notification";
import { addSavedPaymentMethod } from "../api/graphql";
import { useSavedPaymentMethods } from "../composables/useSavedPaymentMethods";
import { MOCK_PAYMENT_CODE, MOCK_TEST_CARDS } from "../constants";
import { cardLabel, errorMessage } from "../utils";
import type { BankCardType } from "@/shared/payment";
import BankCardForm from "@/shared/payment/components/bank-card-form.vue";

const { t } = useI18n();
const notifications = useNotifications();
const { methods, loading, loaded, fetch, remove: removeMethod, setDefault } = useSavedPaymentMethods();

usePageHead({ title: t("product_subscriptions.payment_methods.title") });

const busy = ref<string>();
const toRemove = ref<string>();
const adding = ref(false);
const addError = ref<string>();
const showThreeDs = ref(false);
const setAsDefault = ref(false);
const cardValid = ref(false);
// BankCardForm reads its model only on mount, so a filled-in test card re-mounts it.
const cardFormKey = ref(0);
const card = ref<BankCardType>({ cardholderName: "", number: "", month: "", year: "", securityCode: "" });

const visibleMethods = computed(() => methods.value.filter((x) => x.status !== "Revoked"));

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
      setDefault: setAsDefault.value,
      parameters: [
        { key: "last4", value: digits.slice(-4) },
        { key: "firstDigit", value: digits.charAt(0) },
        { key: "expMonth", value: card.value.month },
        { key: "expYear", value: card.value.year },
        { key: "cardholderName", value: card.value.cardholderName },
        { key: "threeDsCompleted", value: String(threeDsCompleted) },
      ],
    });

    notifications.success({ text: t("product_subscriptions.payment_methods.added") });
    card.value = { cardholderName: "", number: "", month: "", year: "", securityCode: "" };
    cardFormKey.value++;
    await fetch();
  } catch (e) {
    const code = (e as { graphQLErrors?: { extensions?: { code?: string } }[] })?.graphQLErrors?.[0]?.extensions?.code;
    if (code === "AUTHENTICATION_REQUIRED" && !threeDsCompleted) {
      showThreeDs.value = true;
    } else {
      addError.value = errorMessage(e, t("product_subscriptions.errors.generic"));
    }
  } finally {
    adding.value = false;
  }
}

async function makeDefault(id: string) {
  busy.value = `default-${id}`;
  try {
    await setDefault(id);
  } catch (e) {
    notifications.error({ text: errorMessage(e, t("product_subscriptions.errors.generic")) });
  } finally {
    busy.value = undefined;
  }
}

async function remove() {
  if (!toRemove.value) {
    return;
  }

  busy.value = "remove";
  try {
    await removeMethod(toRemove.value);
    notifications.success({ text: t("product_subscriptions.payment_methods.removed") });
    toRemove.value = undefined;
  } catch (e) {
    notifications.error({ text: errorMessage(e, t("product_subscriptions.errors.generic")) });
    toRemove.value = undefined;
  } finally {
    busy.value = undefined;
  }
}

onMounted(fetch);
</script>

<style lang="scss">
.payment-methods-page {
  @apply flex flex-col gap-5;

  &__list {
    @apply divide-y divide-neutral-100;
  }

  &__chip {
    @apply flex items-center gap-2 rounded-full border border-neutral-300 bg-additional-50 px-3 py-1 text-xs text-neutral-800;

    &:hover,
    &:focus-visible {
      @apply border-primary bg-primary-50;
    }
  }
}

.saved-card {
  @apply flex flex-wrap items-center gap-3 px-3 py-4 md:px-5;

  &__icon {
    @apply flex size-12 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-700;
  }

  &__main {
    @apply min-w-0 grow;
  }

  &__title {
    @apply flex flex-wrap items-center gap-2 text-sm font-bold text-neutral-900 md:text-base;
  }

  &__meta {
    @apply mt-0.5 text-xs text-neutral-600 md:text-sm;
  }

  &__actions {
    @apply flex gap-1 max-sm:w-full max-sm:justify-end;
  }
}
</style>
