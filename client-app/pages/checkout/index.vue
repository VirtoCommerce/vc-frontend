<template>
  <div class="bg-gray-100 pt-7 pb-8 shadow-inner">
    <div class="max-w-screen-2xl md:px-12 mx-auto">
      <h2 class="text-gray-800 px-5 md:px-0 text-2xl lg:text-3xl font-bold uppercase mb-7">{Dynamic step title}</h2>

      <div class="flex flex-col lg:flex-row lg:flex-nowrap lg:space-x-6">
        <!-- Main section -->
        <div class="lg:w-3/4 xl:w-4/5 flex-grow w-full">
          <router-view />
        </div>

        <!-- Sidebar -->
        <div class="flex flex-col gap-y-6 px-5 order-first md:px-0 lg:order-1 lg:w-1/4 lg:h-full lg:sticky lg:top-4">
          <OrderSummary :cart="cart">
            <template #footer>
              <VcButton class="uppercase w-full mt-4" is-disabled>{Dynamic next step}</VcButton>

              <p
                class="mt-4 text-xs font-normal text-gray-400"
                v-t="'pages.checkout.order_summary_block.warning_message'"
              />
            </template>
          </OrderSummary>
        </div>
      </div>
    </div>
  </div>
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
