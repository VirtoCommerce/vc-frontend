<template>
  <VcContainer>
    <VcTypography tag="h1" variant="h2" weight="bold" class="mb-5 print:mb-0">
      {{ pageTitle }}
    </VcTypography>

    <VcSteps
      :steps="steps"
      :current-step-index="currentStepIndex"
      :start-step-index="0"
      :disabled="loading || changing"
      class="mb-5"
    />

    <VcLoaderOverlay :visible="loading || !currentStepId" fixed-spinner />

    <router-view />
  </VcContainer>
</template>

<script setup lang="ts">
import { computedEager } from "@vueuse/core";
import { computed, inject } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { usePageHead } from "@/core/composables";
import { configInjectionKey } from "@/core/injection-keys";
import { useFullCart } from "@/shared/cart";
import { useCheckout } from "@/shared/checkout";

const config = inject(configInjectionKey, {});

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const { loading: loadingCart, changing: changingCart, allItemsAreDigital, forceFetch } = useFullCart();
const {
  loading: loadingCheckout,
  changing: changingCheckout,
  placedOrder,
  allOrderItemsAreDigital,
  canPayNow,
  initialize,
} = useCheckout();

const loading = computedEager(() => loadingCart.value || loadingCheckout.value);
const changing = computedEager(() => changingCart.value || changingCheckout.value);

const steps = computed<IStepsItem[]>(() => {
  const result: IStepsItem[] = [];

  if (placedOrder.value) {
    result.push({
      icon: "arrow-bold",
      route: { name: "OrderDetails", params: { orderId: placedOrder.value.id }, replace: true },
      text: t("common.buttons.back_to_order_details"),
    });
  } else {
    result.push({
      icon: "arrow-bold",
      route: { name: "Cart", replace: true },
      text: t("common.buttons.back_to_cart"),
    });
  }

  if (config.checkout_multistep_enabled) {
    result.push(
      {
        id: "Shipping",
        route: { name: "Shipping", replace: true },
        text: t("pages.checkout.steps.shipping"),
        disabled: !!placedOrder.value,
        hidden: allOrderItemsAreDigital.value ?? allItemsAreDigital.value,
      },
      {
        id: "Billing",
        route: { name: "Billing", replace: true },
        text: t("pages.checkout.steps.billing"),
        disabled: !!placedOrder.value,
      },
      {
        id: "Review",
        text: t("pages.checkout.steps.review"),
        disabled: !!placedOrder.value,
      },
    );
  }

  result.push(
    {
      id: "CheckoutPayment",
      text: t("pages.checkout.steps.payment"),
      hidden: !canPayNow.value,
    },
    {
      id: "CheckoutPaymentResult",
      text: t("pages.checkout.steps.completed"),
    },
  );

  return result;
});
const currentStepId = computed(() => route.name as string);
const currentStepIndex = computed(() => steps.value.findIndex((step) => step.id === currentStepId.value));
const pageTitle = computed(() => steps.value[currentStepIndex.value]?.text);

usePageHead({
  title: computed(() => [t("pages.checkout.meta.title"), pageTitle.value]),
});

void (async () => {
  await forceFetch();
  if (route.name === "Checkout") {
    await initialize();
    await router.push({ name: allItemsAreDigital.value ? "Billing" : "Shipping", replace: true });
  }
})();
</script>
