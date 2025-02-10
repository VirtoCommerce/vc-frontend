<template>
  <VcEmptyPage image="b2b.jpg" icon="outline-quotes">
    <VcTypography tag="h1" class="order-first max-sm:mb-5">
      {{ $t("pages.checkout_complete.title") }}
    </VcTypography>

    <div class="sm:mt-3 lg:mt-8">
      <div class="mb-4 font-bold">
        {{ $t("pages.checkout_complete.subtitle", [placedOrder?.number]) }}
      </div>

      {{ $t("pages.checkout_complete.text") }}

      <div class="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-3 sm:justify-start">
        <VcButton
          :to="{ name: 'OrderDetails', params: { orderId: placedOrder?.id } }"
          prepend-icon="document-text"
          min-width="10rem"
        >
          {{ $t("common.buttons.show_order") }}
        </VcButton>

        <VcButton to="/" min-width="10rem">
          {{ $t("common.buttons.home") }}
        </VcButton>
      </div>
    </div>
  </VcEmptyPage>
</template>

<script setup lang="ts">
import { useCheckout } from "@/shared/checkout";

const { placedOrder } = useCheckout();
</script>
