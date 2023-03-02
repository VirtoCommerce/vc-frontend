<template>
  <VcEmptyPage
    :image="
      isPaymentSuccess
        ? '/static/images/order-payment-successful.png'
        : '/static/images/order-payment-completed-failed.png'
    "
    mobile-image="isPaymentSuccess ? '/static/images/order-payment-successful.png' : '/static/images/order-payment-completed-failed.png'"
    class="flex grow flex-col"
  >
    <template #title>
      <h1
        v-t="isPaymentSuccess ? 'pages.payment_result.title.success' : 'pages.payment_result.title.failed'"
        class="mb-3 text-center text-2xl font-bold uppercase lg:hidden lg:text-left"
      />
    </template>

    <template #description>
      <h1
        v-t="isPaymentSuccess ? 'pages.payment_result.title.success' : 'pages.payment_result.title.failed'"
        class="mb-8 hidden text-center text-3xl font-bold uppercase lg:block lg:text-left"
      />

      <div class="mb-10 flex flex-col gap-5 lg:flex-row">
        <VcIcon
          v-if="isPaymentSuccess"
          name="check-circle"
          size="md"
          class="hidden h-12 w-12 shrink-0 text-[color:var(--color-success)] lg:flex"
        />
        <VcIcon
          v-else
          name="x-circle"
          size="md"
          class="hidden h-12 w-12 shrink-0 text-[color:var(--color-danger)] lg:flex"
        />

        <div class="max-w-md text-center text-19 lg:text-left">
          <strong
            v-t="{
              path: isPaymentSuccess ? 'pages.payment_result.title.success' : 'pages.payment_result.title.failed',
              args: [orderNumber],
            }"
            class="mb-4 block"
          />
          <span v-t="isPaymentSuccess ? 'pages.payment_result.text.success' : 'pages.payment_result.text.failed'" />
          <div class="mt-10 flex flex-col items-center justify-center gap-6 md:flex-row lg:justify-start">
            <VcButton to="/" class="w-40 uppercase">
              <i class="fas fa-chevron-left mr-3" />
              {{ $t("pages.payment_result.buttons.payment_details") }}
            </VcButton>

            <VcButton :to="{ name: 'OrderDetails', params: { orderId } }" class="w-40 uppercase">
              <i class="fas fa-file-lines mr-3" />
              {{ $t("pages.payment_result.buttons.show_order") }}
            </VcButton>

            <VcButton v-if="isPaymentSuccess" to="/" class="w-40 uppercase">
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
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core";

const props = defineProps({
  orderId: String,
  orderNumber: String,
  paymentStatus: String,
});

const { t } = useI18n();

usePageHead({
  title: t("pages.payment_result.meta.title"),
});

const isPaymentSuccess = computed<boolean>(() => props.paymentStatus === "Success");
</script>
