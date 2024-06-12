<template>
  <VcEmptyPage
    :image="
      isPaymentSuccess ? '/static/images/order-payment-successful.webp' : '/static/images/order-payment-failed.webp'
    "
    :mobile-image="
      isPaymentSuccess ? '/static/images/order-payment-successful.webp' : '/static/images/order-payment-failed.webp'
    "
    class="flex grow flex-col"
  >
    <template #title>
      <h1 class="mb-3 text-center text-2xl font-bold uppercase lg:hidden lg:text-left">
        {{ $t(isPaymentSuccess ? "pages.payment_result.title.success" : "pages.payment_result.title.failed") }}
      </h1>
    </template>

    <template #description>
      <h1 class="mb-8 hidden text-center text-3xl font-bold uppercase lg:block lg:text-left">
        {{ $t(isPaymentSuccess ? "pages.payment_result.title.success" : "pages.payment_result.title.failed") }}
      </h1>

      <div class="mb-10 flex flex-col gap-4 lg:flex-row">
        <VcIcon
          v-if="isPaymentSuccess"
          name="check-circle"
          size="md"
          class="hidden size-12 shrink-0 text-success lg:flex"
        />

        <VcIcon v-else name="x-circle" size="md" class="hidden size-12 shrink-0 text-danger lg:flex" />

        <div class="max-w-md text-center text-lg lg:text-left">
          <strong class="mb-4 block">
            {{
              $t(isPaymentSuccess ? "pages.payment_result.subtitle.success" : "pages.payment_result.subtitle.failed", [
                placedOrder!.number,
              ])
            }}
          </strong>

          {{ $t(isPaymentSuccess ? "pages.payment_result.text.success" : "pages.payment_result.text.failed") }}

          <div class="mt-10 flex flex-wrap justify-center gap-3 lg:justify-start">
            <VcButton
              v-if="!isPaymentSuccess"
              :to="{ name: 'CheckoutPayment', replace: true }"
              prepend-icon="chevron-left"
            >
              {{ $t("common.buttons.payment_details") }}
            </VcButton>

            <VcButton :to="{ name: 'OrderDetails', params: { orderId: placedOrder!.id } }" prepend-icon="document-text">
              {{ $t("common.buttons.show_order") }}
            </VcButton>

            <VcButton v-if="isPaymentSuccess" to="/">
              {{ $t("common.buttons.home") }}
            </VcButton>
          </div>
        </div>
      </div>
    </template>
  </VcEmptyPage>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useCheckout } from "@/shared/checkout";

interface IProps {
  status: "success" | "failure";
}

const props = defineProps<IProps>();

const { placedOrder } = useCheckout();

const isPaymentSuccess = computed<boolean>(() => props.status === "success");
</script>
