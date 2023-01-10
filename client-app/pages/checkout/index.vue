<template>
  <VcContainer>
    <VcTypography tag="h1" size="h2" weight="bold" class="mb-5"> {Dynamic step title} </VcTypography>

    <VcSteps class="mb-5" :steps="steps" :current-step="3" />

    <VcLayoutWithRightSidebar is-sidebar-sticky>
      <template #main>
        <router-view />
      </template>

      <template #sidebar>
        <OrderSummary :cart="cart">
          <template #footer>
            <VcButton class="uppercase w-full mt-4" is-disabled> {Dynamic next step} </VcButton>

            <p
              class="mt-4 text-xs font-normal text-gray-400"
              v-t="'pages.checkout.order_summary_block.warning_message'"
            />
          </template>
        </OrderSummary>
      </template>
    </VcLayoutWithRightSidebar>
  </VcContainer>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core";
import { useCart } from "@/shared/cart";
import { OrderSummary } from "@/shared/checkout";
import { onMounted } from "vue";
import { useUser, useUserAddresses } from "@/shared/account";

const { t } = useI18n();
const { user } = useUser();
const { fetchAddresses } = useUserAddresses({ user });
const { cart, fetchCart } = useCart();

const steps = [
  {
    icon: "chevron-left",
    to: { name: "Cart" },
    text: "Back to Cart",
  },
  {
    icon: "apply",
    to: { name: "CheckoutShipping" },
    text: "Shipping",
  },
  {
    text: "Billing",
  },
  {
    text: "Order created",
  },
  {
    text: "Completed",
  },
];

usePageHead({
  title: [t("pages.checkout.meta.title"), "{Dynamic step title}"],
});

onMounted(async () => {
  await fetchCart();
  await fetchAddresses();
});
</script>
