<template>
  <VcWidgetSkeleton v-if="loading" head size="lg" />

  <StaticPage v-if="pageExists" />

  <NotFound v-if="!loading && !pageExists" />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useStaticPage } from "@/shared/static-content";
import { usePreviewBuilderPage } from "../composables";
import { getPreviewPageId } from "../utils";
import NotFound from "@/pages/404.vue";
import StaticPage from "@/pages/static-page.vue";

const pageExists = ref<boolean>(false);

const { loading, loadPreviewPage } = usePreviewBuilderPage();
const { staticPagePreview: template } = useStaticPage();

onMounted(async () => {
  try {
    const pageId = getPreviewPageId();
    if (pageId == null) {
      pageExists.value = false;
      return;
    }
    const result = await loadPreviewPage(pageId);
    if (result && result.builderPage && typeof result.builderPage.content === "string") {
      try {
        template.value = JSON.parse(result.builderPage.content);
      } catch (e) {
        console.log("Error parsing page content:", e, result.builderPage.content);
        template.value = undefined;
      }
    }
    pageExists.value = !!template.value;
  } catch (error) {
    console.error("Error loading preview page:", error);
    pageExists.value = false;
  }
});
</script>
