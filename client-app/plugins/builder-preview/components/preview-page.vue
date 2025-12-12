<template>
  <StaticPage v-if="pageExists" />

  <NotFound v-else />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useStaticPage } from "@/shared/static-content";
import { usePreviewBuilderPage } from "../composables";
import { getPreviewPageId } from "../utils";
import NotFound from "@/pages/404.vue";
import StaticPage from "@/pages/static-page.vue";

const pageExists = ref(true); // Placeholder logic to determine if the page exists

const { loadPreviewPage } = usePreviewBuilderPage();
const { staticPagePreview: template } = useStaticPage();

onMounted(async () => {
  try {
    const pageId = getPreviewPageId();
    if (pageId == null) {
      pageExists.value = false;
      return;
    }
    const result = await loadPreviewPage(pageId);
    if (result !== false) {
      template.value = JSON.parse(result.builderPage?.content || "");
    }
    pageExists.value = template.value != null;
  } catch (error) {
    console.error("Error loading preview page:", error);
    pageExists.value = false;
  }
});
</script>
