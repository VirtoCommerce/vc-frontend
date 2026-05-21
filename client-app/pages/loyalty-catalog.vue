<template>
  <VcContainer>
    <VcBreadcrumbs class="mb-2.5 md:mb-4" :items="breadcrumbs" />

    <Category :title is-root :currency-code-override="loyaltyCurrencyCode" />
  </VcContainer>
</template>

<script setup lang="ts">
import { useSeoMeta } from "@unhead/vue";
import { useI18n } from "vue-i18n";
import { useBreadcrumbs } from "@/core/composables";
import { usePageTitle } from "@/core/composables/usePageTitle";
import { useLoyaltySettings } from "@/shared/loyalty/composables/useLoyaltySettings";
import Category from "@/shared/catalog/components/category.vue";

const { t } = useI18n();
const { loyaltyCurrencyCode } = useLoyaltySettings();

const title = t("pages.loyalty_catalog.title");
const { title: pageTitle } = usePageTitle(title);

useSeoMeta({
  title: () => pageTitle.value,
});

const breadcrumbs = useBreadcrumbs(() => [{ title }]);
</script>
