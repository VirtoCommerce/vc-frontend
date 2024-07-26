<template>
  <VcEmptyPage
    image="/static/images/order-completed.webp"
    mobile-image="/static/images/order-completed.webp"
    class="flex grow flex-col"
  >
    <template #title>
      <h1 class="mb-3 text-center text-2xl font-bold uppercase lg:hidden lg:text-left">
        {{ $t("pages.checkout_complete.title") }}
      </h1>
    </template>

    <template #description>
      <h1 class="mb-8 hidden text-center text-3xl font-bold uppercase lg:block lg:text-left">
        {{ $t("pages.checkout_complete.title") }}
      </h1>

      <div class="mb-10 flex flex-col gap-5 lg:flex-row">
        <VcIcon name="check-circle" :size="48" class="hidden text-success lg:block" />

        <div class="max-w-md text-center text-xl lg:text-left">
          <strong class="mb-4 block">
            {{ $t("pages.checkout_complete.subtitle", [placedOrder?.number]) }}
          </strong>

          {{ $t("pages.checkout_complete.text") }}

          <div class="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-4 lg:justify-start">
            <VcButton :to="{ name: 'OrderDetails', params: { orderId: placedOrder?.id } }" min-width="10rem">
              <VcIcon name="document-text" />

              <span>
                {{ $t("common.buttons.show_order") }}
              </span>
            </VcButton>

            <VcButton to="/" min-width="10rem">
              {{ $t("common.buttons.home") }}
            </VcButton>
          </div>
        </div>
      </div>
    </template>
  </VcEmptyPage>
</template>

<script setup lang="ts">
import { useCheckout } from "@/shared/checkout";

const { placedOrder } = useCheckout();
</script>
