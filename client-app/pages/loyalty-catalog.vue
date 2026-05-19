<template>
  <VcContainer>
    <VcBreadcrumbs class="mb-2.5 md:mb-4" :items="breadcrumbs" />

    <Category :title is-root :currency-code-override="loyaltyCurrencyCode" />
  </VcContainer>
</template>

<script setup lang="ts">
import { useSeoMeta } from "@unhead/vue";
import { useBreadcrumbs } from "@/core/composables";
import { usePageTitle } from "@/core/composables/usePageTitle";
import { globals } from "@/core/globals";
import { useLoyaltySettings } from "@/shared/loyalty/composables/useLoyaltySettings";
import Category from "@/shared/catalog/components/category.vue";

const { i18n } = globals;
const { loyaltyCurrencyCode } = useLoyaltySettings();

const title = i18n.global.t("pages.loyalty-catalog.title");
const { title: pageTitle } = usePageTitle(title);

useSeoMeta({
  title: () => pageTitle.value,
});

const breadcrumbs = useBreadcrumbs(() => [{ title }]);
</script>
