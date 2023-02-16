<template>
  <VcEmptyPage
    image="/static/images/order-completed.webp"
    mobile-image="/static/images/order-completed.webp"
    class="flex grow flex-col"
  >
    <template #title>
      <h1
        v-t="'pages.checkout_complete.title'"
        class="mb-3 text-center text-2xl font-bold uppercase lg:hidden lg:text-left"
      />
    </template>

    <template #description>
      <h1
        v-t="'pages.checkout_complete.title'"
        class="mb-8 hidden text-center text-3xl font-bold uppercase lg:block lg:text-left"
      />

      <div class="mb-10 flex flex-col gap-5 lg:flex-row">
        <div
          class="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[color:var(--color-success)] text-white lg:flex"
        >
          <i class="fa fa-check text-2xl" />
        </div>

        <div class="max-w-md text-center text-19 lg:text-left">
          <strong v-t="{ path: 'pages.checkout_complete.subtitle', args: [orderNumber] }" class="mb-4 block" />
          <span v-t="'pages.checkout_complete.text'" />
          <div class="mt-10 flex flex-col items-center justify-center gap-6 md:flex-row lg:justify-start">
            <VcButton :to="{ name: 'OrderDetails', params: { orderId } }" class="w-40 uppercase">
              <i class="fas fa-file-lines mr-3" />
              {{ $t("pages.checkout_complete.buttons.show_order") }}
            </VcButton>

            <VcButton to="/" class="w-40 uppercase">
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
