<template>
  <router-view v-if="currentStepId === 'OrderCompleted' || currentStepId === 'OrderPaymentResult'" />

  <VcContainer v-else-if="initialized">
    <VcTypography tag="h1" variant="h2" weight="bold" class="mb-5">
      {{ pageTitle }}
    </VcTypography>

    <VcSteps
      :steps="steps"
      :current-step-index="currentStepIndex"
      :start-step-index="0"
      :disabled="loadingCheckout"
      class="mb-5"
    />

    <VcLoaderOverlay :visible="loadingCart || loadingCheckout" fixed-spinner />

    <router-view />
  </VcContainer>

  <VcLoaderOverlay v-else no-bg />
</template>

<script setup lang="ts">
import { invoke } from "@vueuse/core";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { RouteRecordName, useRoute } from "vue-router";
import { usePageHead } from "@/core";
import { useCart } from "@/shared/cart";
import { useCheckout } from "@/shared/checkout";
import { PaymentMethodGroupType } from "@/shared/payment";

const route = useRoute();
const { t } = useI18n();
const { loading: loadingCart, payment, availablePaymentMethods } = useCart();
const { loading: loadingCheckout, initialize } = useCheckout();

const initialized = ref(false);
const currentStepId = computed<RouteRecordName>(() => route.name!);
const currentStepIndex = computed<number>(() => steps.value.findIndex((step) => step.id === currentStepId.value));

const pageTitle = computed<string>(() => steps.value[currentStepIndex.value]?.text ?? "<UNKNOWN__FOR_DEV_MODE>");

const steps = computed<IStepsItem[]>(() => {
  const result: IStepsItem[] = [
    {
      icon: "arrow-bold",
      route: { name: "Cart", replace: true },
      text: t("common.buttons.back_to_cart"),
    },
    {
      id: "Shipping",
      route: { name: "Shipping", replace: true },
      text: t("pages.checkout.steps.shipping"),
    },
    {
      id: "Billing",
      route: { name: "Billing", replace: true },
      text: t("pages.checkout.steps.billing"),
    },
    {
      id: "Review",
      route: { name: "Review", replace: true },
      text: t("pages.checkout.steps.review"),
    },
    {
      id: "OrderCompleted",
      text: t("pages.checkout.steps.completed"),
    },
  ];

  const selectedPaymentMethodGroupType = availablePaymentMethods.value.find(
    (item) => item.code === payment.value?.paymentGatewayCode
  )?.paymentMethodGroupType;

  if (selectedPaymentMethodGroupType && selectedPaymentMethodGroupType !== PaymentMethodGroupType[3]) {
    result.splice(
      4,
      1,
      {
        id: "CheckoutPayment",
        route: { name: "CheckoutPayment", replace: true },
        text: t("pages.checkout.steps.payment"),
      },
      {
        id: "OrderPaymentResult",
        text: t("pages.checkout.steps.completed"),
      }
    );
  }
  return result;
});

usePageHead({
  title: computed(() => [t("pages.checkout.meta.title"), pageTitle.value]),
});

invoke(async () => {
  if (currentStepId.value !== "OrderCompleted" && currentStepId.value !== "OrderPaymentResult") {
    await initialize();
    initialized.value = true;
  }
});
</script>
