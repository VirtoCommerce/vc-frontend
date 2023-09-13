<template>
  <router-view v-if="isEmptyLayout" />

  <VcContainer v-else>
    <div class="px-5 print:px-0 lg:px-0">
      <VcTypography tag="h1" variant="h2" weight="bold" class="mb-5 print:mb-0">
        {{ pageTitle }}
      </VcTypography>

      <VcSteps
        :steps="
          currentStepId === 'CheckoutPayment'
            ? [
                {
                  icon: 'arrow-bold',
                  route: { name: 'OrderDetails', params: { orderId: placedOrder?.id }, replace: true },
                  text: $t('common.buttons.back_to_order_details'),
                },
              ]
            : steps
        "
        :current-step-index="currentStepIndex"
        :start-step-index="0"
        :disabled="loadingCheckout"
        class="mb-5"
      />
    </div>

    <VcLoaderOverlay :visible="loadingCart || loadingCheckout" fixed-spinner />

    <router-view />
  </VcContainer>
</template>

<script setup lang="ts">
import { invoke } from "@vueuse/core";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { usePageHead } from "@/core/composables";
import { useCart } from "@/shared/cart";
import { useCheckout } from "@/shared/checkout";

const route = useRoute();
const { t } = useI18n();
const { loading: loadingCart, allItemsAreDigital } = useCart();
const { loading: loadingCheckout, placedOrder, canPayNow, initialize } = useCheckout();

const stepIDsWithEmptyLayout = ["CheckoutPaymentResult", "CheckoutCompleted"];

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
      text: t("pages.checkout.steps.review"),
    },
    {
      id: "CheckoutCompleted",
      text: t("pages.checkout.steps.completed"),
    },
  ];

  if (allItemsAreDigital.value) {
    // Remove "Shipping" step
    result.splice(1, 1);
  }

  if (canPayNow.value) {
    // Replace the last step "Completed" with the payment steps.
    result.splice(
      -1,
      1,
      {
        id: "CheckoutPayment",
        text: t("pages.checkout.steps.payment"),
      },
      {
        id: "CheckoutPaymentResult",
        text: t("pages.checkout.steps.completed"),
      },
    );
  }

  return result;
});
const currentStepId = computed<string>(() => route.name as string);
const currentStepIndex = computed<number>(() => steps.value.findIndex((step) => step.id === currentStepId.value));
const isEmptyLayout = computed<boolean>(() => stepIDsWithEmptyLayout.includes(currentStepId.value));
const pageTitle = computed<string>(() => steps.value[currentStepIndex.value]?.text ?? "<UNKNOWN__FOR_DEV_MODE>");

usePageHead({
  title: computed(() => [t("pages.checkout.meta.title"), pageTitle.value]),
});

invoke(async () => {
  // Initialize on the first step
  if (currentStepIndex.value === 1) {
    await initialize();
  }
});
</script>
