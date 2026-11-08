<template>
  <VcModal
    :show="show"
    :title="$t('product_subscriptions.mock_payment.three_ds_title')"
    icon="shield-check"
    is-persistent
    hide-actions
    max-width="26rem"
    class="three-ds-modal"
    @close="emit('decline')"
  >
    <div class="three-ds-modal__body">
      <VcIcon name="lock" size="lg" color="primary" />

      <p class="three-ds-modal__message">{{ message }}</p>

      <div class="three-ds-modal__actions">
        <VcButton variant="outline" color="neutral" full-width data-test-id="mock-3ds-decline" @click="emit('decline')">
          {{ $t("product_subscriptions.mock_payment.three_ds_decline") }}
        </VcButton>

        <VcButton full-width data-test-id="mock-3ds-approve" @click="emit('approve')">
          {{ $t("product_subscriptions.mock_payment.three_ds_approve") }}
        </VcButton>
      </div>
    </div>
  </VcModal>
</template>

<script setup lang="ts">
interface IProps {
  show: boolean;
  /** What the simulated bank asks the customer to confirm. */
  message: string;
}

interface IEmits {
  (event: "approve"): void;
  (event: "decline"): void;
}

const emit = defineEmits<IEmits>();
defineProps<IProps>();
</script>

<style lang="scss">
.three-ds-modal {
  &__body {
    @apply flex flex-col items-center gap-3 text-center;
  }

  &__message {
    @apply text-sm;
  }

  &__actions {
    @apply flex w-full flex-col gap-2;

    @media (width >= theme("screens.sm")) {
      @apply flex-row;
    }
  }
}
</style>
