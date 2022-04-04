<template>
  <div class="max-w-screen-2xl px-5 md:px-12 mx-auto">
    <VcBreadcrumbs :items="breadcrumbs"></VcBreadcrumbs>
    <h1 class="text-black-800 text-3xl uppercase mt-2 font-bold">
      {{ $t("pages.compare.empty_list.title") }}
    </h1>
  </div>
  <TwoColumn class="max-w-screen-lg">
    <template #left>
      <div class="flex flex-col h-full py-12 justify-center items-center lg:items-start">
        <VcImage
          src="/static/images/errors/emptyCart.webp"
          :alt="$t('pages.compare.empty_list.img_alt_mobile')"
          class="lg:hidden mb-8"
        />
        <h2 class="text-black-800 text-2xl font-bold mb-8 text-center md:text-left">
          {{ $t("pages.compare.empty_list.message") }}
        </h2>

        <VcButton :to="{ name: 'Catalog' }" size="lg" class="p-4 uppercase font-bold">
          {{ $t("pages.compare.empty_list.button_text") }}
        </VcButton>
      </div>
    </template>
    <template #right>
      <VcImage
        src="/static/images/errors/emptyCart.webp"
        :alt="$t('pages.compare.empty_list.img_alt')"
        class="w-full max-w-md"
      />
    </template>
  </TwoColumn>
</template>

<script setup lang="ts">
import { VcImage, VcBreadcrumbs, VcButton, IBreadcrumbs } from "@/components";
import { TwoColumn } from "@/shared/layout";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const breadcrumbs = ref<IBreadcrumbs[]>([
  { title: t("pages.compare.links.home"), route: "/" },
  { title: t("pages.compare.links.compare_products"), route: "/compare-products" },
]);
</script>
