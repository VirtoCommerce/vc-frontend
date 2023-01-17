<template>
  <VcEmptyPage
    image="/static/images/order-completed.webp"
    mobile-image="/static/images/order-completed.webp"
    class="flex flex-col grow"
  >
    <template #title>
      <h1
        class="lg:hidden text-center lg:text-left text-2xl uppercase font-bold mb-3"
        v-t="'pages.checkout_complete.title'"
      />
    </template>

    <template #description>
      <h1
        class="hidden lg:block text-center lg:text-left text-3xl uppercase font-bold mb-8"
        v-t="'pages.checkout_complete.title'"
      />

      <div class="flex flex-col lg:flex-row gap-5 mb-10">
        <div
          class="hidden lg:flex items-center justify-center shrink-0 h-12 w-12 rounded-full text-white bg-[color:var(--color-success)]"
        >
          <i class="fa fa-check text-2xl" />
        </div>

        <div class="text-19 text-center lg:text-left max-w-md">
          <strong class="block mb-4" v-t="{ path: 'pages.checkout_complete.subtitle', args: [orderNumber] }" />
          <span v-t="'pages.checkout_complete.text'" />
          <div class="flex flex-col md:flex-row items-center justify-center lg:justify-start gap-6 mt-10">
            <VcButton :to="{ name: 'OrderDetails', params: { orderId } }" class="uppercase w-40">
              <i class="fas fa-file-lines mr-3" />
              {{ $t("pages.checkout_complete.buttons.show_order") }}
            </VcButton>

            <VcButton to="/" class="uppercase w-40">
              {{ $t("common.buttons.home") }}
            </VcButton>
          </div>
        </div>
      </div>
    </template>
  </VcEmptyPage>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { usePageHead } from "@/core";

defineProps({
  orderId: String,
  orderNumber: String,
});

const { t } = useI18n();

usePageHead({
  title: t("pages.checkout_complete.meta.title"),
});
</script>
