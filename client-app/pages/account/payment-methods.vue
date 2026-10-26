<template>
  <div class="payment-methods-page">
    <div>
      <VcTypography tag="h1">{{ $t("shared.payment.saved_cards.page_title") }}</VcTypography>

      <p class="mt-1 text-sm text-neutral-600">{{ $t("shared.payment.saved_cards.page_subtitle") }}</p>
    </div>

    <VcWidget size="lg">
      <template #default-container>
        <VcLoaderOverlay v-if="loading && !loaded" />

        <VcEmptyView
          v-else-if="!visibleMethods.length"
          :text="$t('shared.payment.saved_cards.empty')"
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
                {{ savedCardLabel(method.brand, method.last4) }}
                <VcBadge v-if="method.isDefault" size="sm" variant="soft" color="info" rounded>{{
                  $t("shared.payment.saved_cards.default")
                }}</VcBadge>

                <VcBadge v-if="method.isExpired" size="sm" variant="soft" color="danger" rounded>{{
                  $t("shared.payment.saved_cards.expired")
                }}</VcBadge>

                <VcBadge v-else-if="method.status !== 'Active'" size="sm" variant="soft" color="warning" rounded>{{
                  $t("shared.payment.saved_cards.needs_update")
                }}</VcBadge>
              </div>

              <div class="saved-card__meta">
                {{
                  $t("shared.payment.saved_cards.expires", {
                    date: `${method.expirationMonth}/${method.expirationYear}`,
                  })
                }}
                <template v-if="providerName(method.paymentMethodCode)">
                  · {{ providerName(method.paymentMethodCode) }}
                </template>

                <template v-if="method.cardholderName"> · {{ method.cardholderName }}</template>
              </div>
            </div>

            <div class="saved-card__actions">
              <VcButton
                v-if="!method.isDefault && method.status === 'Active' && !method.isExpired"
                size="xs"
                variant="ghost"
                :loading="busy === `default-${method.id}`"
                :data-test-id="`saved-card-default-${method.last4}`"
                @click="makeDefault(method.id)"
              >
                {{ $t("shared.payment.saved_cards.make_default") }}
              </VcButton>

              <VcButton
                size="xs"
                variant="ghost"
                color="danger"
                :data-test-id="`saved-card-remove-${method.last4}`"
                @click="toRemove = method.id"
              >
                {{ $t("shared.payment.saved_cards.remove") }}
              </VcButton>
            </div>
          </li>
        </ul>
      </template>
    </VcWidget>

    <VcWidget
      v-if="formMethods.length"
      :title="$t('shared.payment.saved_cards.add_title')"
      prepend-icon="plus"
      size="lg"
    >
      <div v-if="formMethods.length > 1" class="payment-methods-page__providers" role="radiogroup">
        <VcRadioButton
          v-for="method in formMethods"
          :key="method.paymentMethodCode"
          v-model="providerCode"
          :value="method.paymentMethodCode"
          name="card-provider"
          size="sm"
          :data-test-id="`card-provider-${method.paymentMethodCode}`"
        >
          {{ method.name || method.paymentMethodCode }}
        </VcRadioButton>
      </div>

      <template v-if="provider">
        <AddCardAuthorizeNet
          v-if="provider.paymentMethodCode === AUTHORIZE_NET_PAYMENT_CODE"
          :key="provider.paymentMethodCode"
          :method="provider"
          :set-default="setAsDefault"
          @added="onAdded"
        >
          <VcCheckbox v-model="setAsDefault" class="mt-4">{{
            $t("shared.payment.saved_cards.set_default")
          }}</VcCheckbox>
        </AddCardAuthorizeNet>

        <template v-else>
          <ExtensionPoint
            :key="provider.paymentMethodCode"
            category="addCardForm"
            :name="provider.paymentMethodCode"
            :payment-method-code="provider.paymentMethodCode"
            :set-default="setAsDefault"
            @added="onAdded"
          />

          <VcCheckbox v-model="setAsDefault" class="mt-4">{{
            $t("shared.payment.saved_cards.set_default")
          }}</VcCheckbox>
        </template>
      </template>
    </VcWidget>

    <VcConfirmationModal
      v-if="toRemove"
      :title="$t('shared.payment.saved_cards.remove_title')"
      :text="$t('shared.payment.saved_cards.remove_text')"
      variant="danger"
      icon="trash"
      :loading="busy === 'remove'"
      @confirm="remove"
      @close="toRemove = undefined"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core/composables";
import { DEFAULT_NOTIFICATION_DURATION } from "@/core/constants";
import { Logger } from "@/core/utilities";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import { useNotifications } from "@/shared/notification";
import { getCardPaymentMethods } from "@/shared/payment/api/graphql";
import { useSavedPaymentMethods } from "@/shared/payment/composables/useSavedPaymentMethods";
import { savedCardErrorMessage, savedCardLabel } from "@/shared/payment/utils/saved-card-label";
import type { GetCardPaymentMethodsQuery } from "@/shared/payment/api/graphql/types";
import AddCardAuthorizeNet from "@/shared/payment/components/add-card-authorize-net.vue";

const AUTHORIZE_NET_PAYMENT_CODE = "AuthorizeNetPaymentMethod";

const { t } = useI18n();
const notifications = useNotifications();
const { methods, loading, loaded, fetch, remove: removeMethod, setDefault } = useSavedPaymentMethods();
const { canRender } = useExtensionRegistry();

usePageHead({ title: t("shared.payment.saved_cards.page_title") });

const busy = ref<string>();
const toRemove = ref<string>();
const setAsDefault = ref(false);
const cardMethods = ref<GetCardPaymentMethodsQuery["cardPaymentMethods"]>([]);
const providerCode = ref<string>();

const visibleMethods = computed(() => methods.value.filter((x) => x.status !== "Revoked"));

/** Payment methods this page has a card form for: Authorize.Net built in, others through the addCardForm extension point. */
const formMethods = computed(() =>
  cardMethods.value.filter(
    (x) =>
      x.paymentMethodCode === AUTHORIZE_NET_PAYMENT_CODE ||
      canRender("addCardForm", x.paymentMethodCode, x.paymentMethodCode),
  ),
);
const provider = computed(() => formMethods.value.find((x) => x.paymentMethodCode === providerCode.value));

function providerName(paymentMethodCode: string): string | undefined {
  return cardMethods.value.length > 1
    ? (cardMethods.value.find((x) => x.paymentMethodCode === paymentMethodCode)?.name ?? undefined)
    : undefined;
}

async function loadCardMethods() {
  try {
    cardMethods.value = await getCardPaymentMethods();
    providerCode.value = formMethods.value[0]?.paymentMethodCode;
  } catch (e) {
    Logger.error("payment-methods.loadCardMethods", e);
  }
}

async function onAdded() {
  notifications.success({
    duration: DEFAULT_NOTIFICATION_DURATION,
    single: true,
    text: t("shared.payment.saved_cards.added"),
  });
  await fetch();
}

async function makeDefault(id: string) {
  busy.value = `default-${id}`;
  try {
    await setDefault(id);
  } catch (e) {
    notifications.error({
      duration: DEFAULT_NOTIFICATION_DURATION,
      single: true,
      text: savedCardErrorMessage(e, t("shared.payment.saved_cards.error")),
    });
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
    notifications.success({
      duration: DEFAULT_NOTIFICATION_DURATION,
      single: true,
      text: t("shared.payment.saved_cards.removed"),
    });
  } catch (e) {
    notifications.error({
      duration: DEFAULT_NOTIFICATION_DURATION,
      single: true,
      text: savedCardErrorMessage(e, t("shared.payment.saved_cards.error")),
    });
  } finally {
    toRemove.value = undefined;
    busy.value = undefined;
  }
}

onMounted(() => Promise.all([fetch(), loadCardMethods()]));
</script>

<style lang="scss">
.payment-methods-page {
  @apply flex flex-col gap-5;

  &__list {
    @apply divide-y divide-neutral-100;
  }

  &__providers {
    @apply mb-4 flex flex-wrap gap-x-6 gap-y-2;
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
