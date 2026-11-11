<template>
  <div class="payment-methods">
    <div>
      <VcTypography tag="h1">{{ $t("shared.payment.saved_cards.page_title") }}</VcTypography>

      <p class="payment-methods__subtitle">{{ $t("shared.payment.saved_cards.page_subtitle") }}</p>
    </div>

    <VcWidget size="lg">
      <template #default-container>
        <VcLoaderOverlay v-if="loading && !loaded" />

        <div v-else-if="failed" class="payment-methods__error">
          <VcAlert color="danger" size="sm" variant="soft" icon data-test-id="payment-methods-load-error">
            {{ $t("shared.payment.saved_cards.load_failed") }}

            <VcButton
              size="xs"
              variant="outline"
              class="payment-methods__retry"
              data-test-id="payment-methods-retry"
              @click="fetch()"
            >
              {{ $t("shared.payment.saved_cards.retry") }}
            </VcButton>
          </VcAlert>
        </div>

        <VcEmptyView
          v-else-if="!visibleMethods.length"
          :text="$t('shared.payment.saved_cards.empty')"
          icon="credit-card"
        />

        <ul v-else class="payment-methods__list">
          <SavedCard
            v-for="method in visibleMethods"
            :key="method.id"
            :method="method"
            :provider-name="providerName(method.paymentMethodCode)"
            :making-default="busy === `default-${method.id}`"
            @make-default="makeDefault(method.id)"
            @remove="toRemove = method.id"
          />
        </ul>
      </template>
    </VcWidget>

    <VcWidget
      v-if="formMethods.length || cardMethodsFailed"
      :title="$t('shared.payment.saved_cards.add_title')"
      prepend-icon="plus"
      size="lg"
    >
      <VcAlert
        v-if="cardMethodsFailed"
        color="danger"
        size="sm"
        variant="soft"
        icon
        data-test-id="payment-methods-forms-error"
      >
        {{ $t("shared.payment.saved_cards.forms_load_failed") }}

        <VcButton
          size="xs"
          variant="outline"
          class="payment-methods__retry"
          data-test-id="payment-methods-forms-retry"
          @click="loadCardMethods()"
        >
          {{ $t("shared.payment.saved_cards.retry") }}
        </VcButton>
      </VcAlert>

      <div v-else-if="formMethods.length > 1" class="payment-methods__providers" role="radiogroup">
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
          v-if="provider.paymentMethodCode === AUTHORIZE_NET_PAYMENT_METHOD_CODE"
          :key="provider.paymentMethodCode"
          :method="provider"
          :set-default="setAsDefault"
          @added="onAdded"
        >
          <VcCheckbox v-model="setAsDefault" class="payment-methods__set-default">{{
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

          <VcCheckbox v-model="setAsDefault" class="payment-methods__set-default">{{
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
import { AUTHORIZE_NET_PAYMENT_METHOD_CODE } from "@/shared/payment/constants";
import { savedCardErrorMessage } from "@/shared/payment/utils/saved-card-label";
import type { GetCardPaymentMethodsQuery } from "@/shared/payment/api/graphql/types";
import AddCardAuthorizeNet from "@/shared/payment/components/add-card-authorize-net.vue";
import SavedCard from "@/shared/payment/components/saved-card.vue";

const { t } = useI18n();
const notifications = useNotifications();
const { methods, loading, loaded, failed, fetch, remove: removeMethod, setDefault } = useSavedPaymentMethods();
const { canRender } = useExtensionRegistry();

usePageHead({ title: t("shared.payment.saved_cards.page_title") });

const busy = ref<string>();
const toRemove = ref<string>();
const setAsDefault = ref(false);
const cardMethods = ref<GetCardPaymentMethodsQuery["cardPaymentMethods"]>([]);
const providerCode = ref<string>();
const cardMethodsFailed = ref(false);

const visibleMethods = computed(() => methods.value.filter((x) => x.status !== "Revoked"));

/** Payment methods this page has a card form for: Authorize.Net built in, others through the addCardForm extension point. */
const formMethods = computed(() =>
  cardMethods.value.filter(
    (x) =>
      x.paymentMethodCode === AUTHORIZE_NET_PAYMENT_METHOD_CODE ||
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
  cardMethodsFailed.value = false;
  try {
    cardMethods.value = await getCardPaymentMethods();
    providerCode.value = formMethods.value[0]?.paymentMethodCode;
  } catch (e) {
    Logger.error("payment-methods.loadCardMethods", e);
    cardMethodsFailed.value = true;
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
.payment-methods {
  @apply flex flex-col gap-5;

  &__subtitle {
    @apply mt-1 text-sm text-neutral-600;
  }

  &__list {
    @apply divide-y divide-neutral-100;
  }

  &__error {
    @apply p-5;
  }

  &__retry {
    @apply mt-2;
  }

  &__providers {
    @apply mb-4 flex flex-wrap gap-x-6 gap-y-2;
  }

  &__set-default {
    @apply mt-4;
  }
}
</style>
