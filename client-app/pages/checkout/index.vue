<template>
  <VcContainer v-if="initialized">
    <VcTypography tag="h1" variant="h2" weight="bold" class="mb-5"> {Dynamic step title}</VcTypography>

    <VcSteps class="mb-5" :steps="steps" :start-step="0" :current-step="3" />

    <VcLayoutWithRightSidebar is-sidebar-sticky>
      <template #main>
        <router-view />
      </template>

      <template #sidebar>
        <OrderSummary :cart="cart">
          <template #footer>
            <p class="mt-6 mb-5 text-xs font-normal text-gray-400">
              {{ $t("common.messages.checkout_pricing_warning") }}
            </p>

            <VcButton class="uppercase w-full" is-disabled> {Dynamic next step}</VcButton>
          </template>
        </OrderSummary>
      </template>
    </VcLayoutWithRightSidebar>
  </VcContainer>

  <VcLoaderOverlay v-else no-bg />
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { invoke } from "@vueuse/core";
import { usePageHead } from "@/core";
import { useCart } from "@/shared/cart";
import { OrderSummary, useCheckout } from "@/shared/checkout";

const { t } = useI18n();
const { cart } = useCart();
const { initialized, initialize } = useCheckout();

usePageHead({
  title: [t("pages.checkout.meta.title"), "{Dynamic step title}"],
});

const steps: IStepsItem[] = [
  {
    text: "Back to Cart",
    icon: "arrow-bold",
    route: { name: "Cart" },
  },
  {
    text: "Shipping",
    route: { name: "CheckoutShipping" },
  },
  {
    text: "Billing",
    route: { name: "CheckoutBilling" },
  },
  {
    text: "Order created",
  },
  {
    text: "Completed",
  },
];

invoke(async () => {
  await initialize();
});
</script>
