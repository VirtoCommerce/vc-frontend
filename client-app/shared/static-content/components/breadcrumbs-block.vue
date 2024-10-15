<template>
  <VcBreadcrumbs class="mb-2.5 md:mb-4" :items="breadcrumbs" />
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useBreadcrumbs } from "@/core/composables";
import { buildBreadcrumbs } from "@/core/utilities";
import type { RouteLocationRaw } from "vue-router";

interface IProps {
  breadcrumbs: { title: string; route?: RouteLocationRaw }[];
}

const props = defineProps<IProps>();

const { t } = useI18n();

const catalogBreadcrumb: IBreadcrumb = { title: t("pages.catalog.title"), route: { name: "Catalog" } };

const breadcrumbs = useBreadcrumbs(() => {
  return [catalogBreadcrumb].concat(buildBreadcrumbs(props.breadcrumbs));
});
</script>
