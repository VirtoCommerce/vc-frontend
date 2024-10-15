<template>
  <VcBreadcrumbs :items="breadcrumbs" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useBreadcrumbs } from "@/core/composables";
import { buildBreadcrumbs } from "@/core/utilities";

interface IProps {
  breadcrumbs: { title: string; seoPath?: string }[];
}

const props = defineProps<IProps>();

const breadcrumbs = useBreadcrumbs(computed(() => buildBreadcrumbs(props.breadcrumbs)));
</script>
