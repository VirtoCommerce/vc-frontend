<template>
  <VcModal
    class="subscription-card-modal"
    :title="$t('product_subscriptions.deliveries.card_title')"
    icon="credit-card"
    max-width="30rem"
    test-id="subscription-card-modal"
  >
    <div class="subscription-card-modal__body">
      <p>
        {{
          products.length > 1
            ? $t("product_subscriptions.deliveries.card_lead_many")
            : $t("product_subscriptions.deliveries.card_lead_one", { product: products[0] ?? "" })
        }}
      </p>

      <VcList v-if="products.length > 1">
        <VcListItem v-for="(product, index) in products" :key="index">
          <template #title>
            <span class="subscription-card-modal__product" :title="product">{{ product }}</span>
          </template>
        </VcListItem>
      </VcList>

      <VcSelect
        v-if="cardItems.length"
        v-model="selectedId"
        :label="$t('product_subscriptions.deliveries.card_label')"
        :items="cardItems"
        text-field="label"
        value-field="id"
        :placeholder="$t('product_subscriptions.deliveries.choose_card')"
        :disabled="loading"
        test-id="subscription-card-select"
      />

      <VcAlert v-else-if="loaded" color="info" variant="soft" size="sm" icon>
        {{ $t("product_subscriptions.deliveries.no_cards") }}
      </VcAlert>

      <router-link :to="{ name: ROUTES.PAYMENT_METHODS.NAME }" class="subscription-card-modal__link">
        {{ $t("product_subscriptions.deliveries.manage_cards") }}
      </router-link>

      <VcAlert v-if="error" color="danger" variant="soft" size="sm" icon>{{ error }}</VcAlert>
    </div>

    <template #actions="{ close }">
      <VcButton :disabled="loading" color="secondary" variant="outline" @click="close">
        {{ $t("ui_kit.buttons.cancel") }}
      </VcButton>

      <VcButton
        :loading="loading"
        :disabled="!selectedId || selectedId === currentCardId"
        data-test-id="subscription-card-modal-save"
        @click="save(close)"
      >
        {{ $t("product_subscriptions.purchase_options.save") }}
      </VcButton>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { ROUTES } from "@/router/routes/constants";
import { useSavedPaymentMethods } from "@/shared/payment/composables/useSavedPaymentMethods";
import { savedCardExpiry, savedCardLabel } from "@/shared/payment/utils/saved-card-label";
import { subscriptionErrorMessage } from "../utils";

interface IProps {
  /** Names of the products whose subscriptions get the card. */
  products: string[];
  /** The card the subscriptions use now; preselected. */
  currentCardId?: string;
  /** Saves the chosen card. Rejects on failure; the dialog then shows the error and stays open. */
  onSave: (cardId: string) => Promise<void>;
}

const props = withDefaults(defineProps<IProps>(), {
  currentCardId: undefined,
});

const { t } = useI18n();
const { activeMethods, fetch } = useSavedPaymentMethods();

const selectedId = ref<string>();
const loading = ref(false);
const loaded = ref(false);
const error = ref<string>();

// Only active, unexpired cards can be chosen; the card in use is listed even when it no longer is.
const cardItems = computed(() =>
  activeMethods.value.map((x) => ({
    id: x.id,
    label: [
      savedCardLabel(x.brand, x.last4, t("shared.payment.saved_cards.card")),
      savedCardExpiry(x.expirationMonth, x.expirationYear),
    ]
      .filter(Boolean)
      .join(" · "),
  })),
);

async function save(close: () => void): Promise<void> {
  if (!selectedId.value) {
    return;
  }
  loading.value = true;
  error.value = undefined;
  try {
    await props.onSave(selectedId.value);
    close();
  } catch (e) {
    error.value = subscriptionErrorMessage(e, t);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await fetch({ suppressErrorNotifications: true });
  loaded.value = true;
  // Preselect the card in use while it can still be chosen.
  if (props.currentCardId && activeMethods.value.some((x) => x.id === props.currentCardId)) {
    selectedId.value ??= props.currentCardId;
  }
});
</script>

<style lang="scss">
.subscription-card-modal {
  &__body {
    @apply flex flex-col gap-3;
  }

  &__product {
    @apply line-clamp-2;
  }

  &__link {
    @apply self-start text-sm text-[--link-color] hover:text-[--link-hover-color];
  }
}
</style>
