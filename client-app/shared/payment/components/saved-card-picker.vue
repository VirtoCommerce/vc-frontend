<template>
  <div v-if="methods.length" class="saved-card-picker" data-test-id="saved-card-picker">
    <VcLabel>{{ $t("shared.payment.saved_cards.pay_with") }}</VcLabel>

    <div
      v-for="method in methods"
      :key="method.id"
      class="saved-card-picker__option"
      :class="{ 'saved-card-picker__option--active': model === method.id }"
    >
      <VcRadioButton
        v-model="model"
        :value="method.id"
        :name="name"
        :disabled="disabled"
        size="sm"
        class="saved-card-picker__radio"
        :data-test-id="`saved-card-option-${method.last4}`"
      >
        <span class="saved-card-picker__content">
          <VcIcon name="credit-card" size="sm" />

          <span class="saved-card-picker__text">
            {{ savedCardLabel(method.brand, method.last4, $t("shared.payment.saved_cards.card")) }}
            <span
              v-if="savedCardExpiry(method.expirationMonth, method.expirationYear)"
              class="saved-card-picker__expiry"
              >{{ savedCardExpiry(method.expirationMonth, method.expirationYear) }}</span
            >
          </span>

          <VcBadge v-if="method.isDefault" size="sm" variant="soft" color="info" rounded>{{
            $t("shared.payment.saved_cards.default")
          }}</VcBadge>
        </span>
      </VcRadioButton>
    </div>

    <div class="saved-card-picker__option" :class="{ 'saved-card-picker__option--active': model === newCardValue }">
      <VcRadioButton
        v-model="model"
        :value="newCardValue"
        :name="name"
        :disabled="disabled"
        size="sm"
        class="saved-card-picker__radio"
        data-test-id="saved-card-option-new"
      >
        <span class="saved-card-picker__content">
          <VcIcon name="plus" size="sm" />

          <span class="saved-card-picker__text">{{ $t("shared.payment.saved_cards.new_card") }}</span>
        </span>
      </VcRadioButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { savedCardExpiry, savedCardLabel } from "../utils/saved-card-label";
import type { SavedPaymentMethodFieldsFragment } from "../api/graphql/types";

interface IProps {
  methods: SavedPaymentMethodFieldsFragment[];
  /** The value that stands for "use a new card". */
  newCardValue: string;
  name: string;
  disabled?: boolean;
}

defineProps<IProps>();

const model = defineModel<string>({ required: true });
</script>

<style lang="scss">
.saved-card-picker {
  @apply mb-4 flex flex-col gap-2;

  &__option {
    @apply rounded-[--vc-radius] border border-neutral-200 p-3 text-sm;

    // Selection is accent, not primary: primary stays with the action (Pay).
    &--active {
      @apply border-accent bg-accent-50;
    }
  }

  &__radio {
    // the checked marker follows the card: accent, not the primary default
    --vc-radio-button-base-color: var(--color-accent-500);
  }

  &__content {
    @apply flex min-w-0 items-center gap-3;
  }

  &__text {
    @apply flex flex-wrap items-center gap-x-2;
  }

  &__expiry {
    @apply text-neutral-600;
  }
}
</style>
