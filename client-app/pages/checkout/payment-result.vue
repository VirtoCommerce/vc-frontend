<template>
  <VcEmptyPage
    :icon="isPaymentSuccess ? 'outline-payment-success' : 'outline-payment-failed'"
    :status-color="isPaymentSuccess ? 'success' : 'danger'"
    image="basket.jpg"
  >
    <VcTypography tag="h1" class="order-first mb-3">
      {{ $t(isPaymentSuccess ? "pages.payment_result.title.success" : "pages.payment_result.title.failed") }}
    </VcTypography>

    <div class="order-first mb-3 text-base font-bold">
      {{
        $t(isPaymentSuccess ? "pages.payment_result.subtitle.success" : "pages.payment_result.subtitle.failed", [
          placedOrder!.number,
        ])
      }}
    </div>

    <div>
      {{ $t(isPaymentSuccess ? "pages.payment_result.text.success" : "pages.payment_result.text.failed") }}

      <div class="mt-10 flex flex-wrap justify-center gap-3 sm:justify-start">
        <VcButton v-if="!isPaymentSuccess" :to="{ name: 'CheckoutPayment', replace: true }" prepend-icon="chevron-left">
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
