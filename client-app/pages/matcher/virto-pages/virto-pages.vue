<template>
  <div>
    <VPPageBuilder v-if="isPageBuilderContent" :content="pageDocument?.content" />
    <VPBuilderIO v-if="isBulderIOContent" :content="pageDocument?.content" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import VPBuilderIO from "@/pages/matcher/virto-pages/vp-builder-io.vue";
import VPPageBuilder from "@/pages/matcher/virto-pages/vp-page-builder.vue";

interface IProps {
  pageDocument: { id: string; source?: string; permalink?: string; content: string } | null;
}

const props = defineProps<IProps>();

const isBulderIOContent = computed(() => {
  return props.pageDocument?.source === "builder.io";
});

const isPageBuilderContent = computed(() => {
  return props.pageDocument?.source === "page-builder";
});
</script>
