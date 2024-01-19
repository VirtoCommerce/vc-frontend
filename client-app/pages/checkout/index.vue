<template>
  <VcContainer>
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

    <VcLoaderOverlay :visible="loadingCart || loadingCheckout || currentStepIndex == -1" fixed-spinner />

    <router-view />
  </VcContainer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { usePageHead } from "@/core/composables";
import { useFullCart } from "@/shared/cart";
import { useCheckout } from "@/shared/checkout";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const { loading: loadingCart, allItemsAreDigital, forceFetch } = useFullCart();
const { loading: loadingCheckout, placedOrder, canPayNow, initialize } = useCheckout();

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
const currentStepId = computed(() => route.name as string);
const currentStepIndex = computed(() => steps.value.findIndex((step) => step.id === currentStepId.value));
const pageTitle = computed(() => steps.value[currentStepIndex.value]?.text);

usePageHead({
  title: computed(() => [t("pages.checkout.meta.title"), pageTitle.value]),
});

void (async () => {
  await forceFetch();
  await initialize();
  await router.push({ name: allItemsAreDigital.value ? "Billing" : "Shipping", replace: true });
})();
</script>
