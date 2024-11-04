<template>
  <div>
    <VPBuilderIO v-if="isBulderIOContent" :content="pageDocumentContent?.content" />
  </div>
</template>

<script setup lang="ts">
import { computedEager } from "@vueuse/core";
import { computed, defineAsyncComponent, watch, watchEffect } from "vue";
import { useSlugInfo } from "@/shared/common";
import type { StateType } from "@/pages/matcher/priorityManager";

interface IProps {
  pathMatch?: string[];
  isVisible?: boolean;
  // pageDocument: { id: string; source?: string; permalink?: string; content: string } | null;
}

interface IEmits {
  (event: "setState", value: StateType): void;
}

const props = defineProps<IProps>();
const emit = defineEmits<IEmits>();

const VPBuilderIO = defineAsyncComponent(() => import("@/pages/matcher/virto-pages/vp-builder-io.vue"));

const seoUrl = computedEager(() => {
  if (!props.pathMatch) {
    return "/";
  }
  // Because URL `/printers/` is an array of paths ["printers", ""], empty paths must be removed.
  const paths = props.pathMatch.filter(Boolean);
  return paths.join("/");
});

const {
  loading,
  slugInfo,
  objectType,
  hasPageDocumentContent,
  pageDocumentContent,
  fetchPageDocumentContent,
} = useSlugInfo(seoUrl);

const isBulderIOContent = computed(() => {
  return objectType.value === "Pages"
    && hasPageDocumentContent.value
    && pageDocumentContent.value?.source === "builder.io";
});

watchEffect(() => {
  if (loading.value) {
    emit("setState", "loading");
  } else if (pageDocumentContent.value) {
    emit("setState", "ready");
  } else {
    emit("setState", "empty");
  }
});

watch(slugInfo, () => {
  const type = slugInfo.value?.entityInfo?.objectType;
  if (type === 'Pages') {
    void fetchPageDocumentContent();
  }
});

</script>
