<template>
  <div>
    <VPBuilderIO ng-if="pageDocument.source === 'builder.io'" :content="pageDocument?.content" />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue";

defineProps<IProps>();

const VPBuilderIO = defineAsyncComponent(() => import("@/pages/virto-pages/vp-builder-io.vue"));

interface IProps {
  pageDocument: { id: string; source?: string; permalink?: string; content: string } | null;
}
</script>
