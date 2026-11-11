<template>
  <li class="saved-card" :data-test-id="`saved-card-${method.last4}`">
    <div class="saved-card__icon"><VcIcon name="credit-card" size="md" /></div>

    <div class="saved-card__main">
      <div class="saved-card__title">
        {{ savedCardLabel(method.brand, method.last4, $t("shared.payment.saved_cards.card")) }}
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

      <div v-if="details.length" class="saved-card__meta">{{ details.join(" · ") }}</div>
    </div>

    <div class="saved-card__actions">
      <VcButton
        v-if="canMakeDefault"
        size="xs"
        variant="ghost"
        :loading="makingDefault"
        :data-test-id="`saved-card-default-${method.last4}`"
        @click="emit('makeDefault')"
      >
        {{ $t("shared.payment.saved_cards.make_default") }}
      </VcButton>

      <VcButton
        size="xs"
        variant="ghost"
        color="danger"
        :data-test-id="`saved-card-remove-${method.last4}`"
        @click="emit('remove')"
      >
        {{ $t("shared.payment.saved_cards.remove") }}
      </VcButton>
    </div>
  </li>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { savedCardExpiry, savedCardLabel } from "../utils/saved-card-label";
import type { SavedPaymentMethodFieldsFragment } from "../api/graphql/types";

interface IProps {
  method: SavedPaymentMethodFieldsFragment;
  /** The payment method that keeps the card, shown when the store has more than one. */
  providerName?: string;
  makingDefault?: boolean;
}

interface IEmits {
  (event: "makeDefault"): void;
  (event: "remove"): void;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();

const { t } = useI18n();

/** Expiry, provider and cardholder, each only when known. */
const details = computed(() => {
  const expiry = savedCardExpiry(props.method.expirationMonth, props.method.expirationYear);
  return [
    expiry && t("shared.payment.saved_cards.expires", { date: expiry }),
    props.providerName,
    props.method.cardholderName,
  ].filter((x): x is string => !!x);
});

const canMakeDefault = computed(
  () => !props.method.isDefault && props.method.status === "Active" && !props.method.isExpired,
);
</script>

<style lang="scss">
.saved-card {
  @apply flex flex-wrap items-center gap-3 px-3 py-4;

  @media (width >= theme("screens.md")) {
    @apply px-5;
  }

  &__icon {
    @apply flex size-12 shrink-0 items-center justify-center rounded-[--vc-radius] bg-neutral-100 text-neutral-700;
  }

  &__main {
    @apply min-w-0 grow;
  }

  &__title {
    @apply flex flex-wrap items-center gap-2 text-sm font-bold text-neutral-900;

    @media (width >= theme("screens.md")) {
      @apply text-base;
    }
  }

  &__meta {
    @apply mt-0.5 text-xs text-neutral-600;

    @media (width >= theme("screens.md")) {
      @apply text-sm;
    }
  }

  &__actions {
    @apply flex gap-1;

    @media (width < theme("screens.sm")) {
      @apply w-full justify-end;
    }
  }
}
</style>
