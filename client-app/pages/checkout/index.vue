<template>
  <VcContainer>
    <h2 class="text-gray-800 px-5 md:px-0 text-2xl lg:text-3xl font-bold uppercase mb-7">{Dynamic step title}</h2>

    <VcLayoutWithRightSidebar is-sidebar-sticky>
      <template #main>
        <router-view />
      </template>

      <template #sidebar>
        <OrderSummary :cart="cart">
          <template #footer>
            <VcButton class="uppercase w-full mt-4" is-disabled>{Dynamic next step}</VcButton>

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

const { t } = useI18n();
const { cart } = useCart();

usePageHead({
  title: [t("pages.checkout.meta.title"), "{Dynamic step title}"],
});
</script>
