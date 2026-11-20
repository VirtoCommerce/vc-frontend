<template>
  <VcContainer :has-bg-image="false">
    <VcEmptyView
      size="xl"
      reason="done"
      :text="$t('pages.checkout_complete.title')"
      :description="$t('pages.checkout_complete.subtitle', [placedOrder?.number])"
      :hint="$t('pages.checkout_complete.text')"
      :data-order-number="placedOrder?.number"
    >
      <template #icon>
        <VcEmptyIcon name="order-completed" />
      </template>

      <template #button>
        <VcButton :to="{ name: 'OrderDetails', params: { orderId: placedOrder?.id } }" prepend-icon="document-text">
          {{ $t("common.buttons.show_order") }}
        </VcButton>

        <VcButton to="/" variant="outline" color="secondary">
          {{ $t("common.buttons.home") }}
        </VcButton>
      </template>
    </VcEmptyView>
  </VcContainer>
</template>

<script setup lang="ts">
import { useCheckout } from "@/shared/checkout";

const { placedOrder } = useCheckout();
</script>
