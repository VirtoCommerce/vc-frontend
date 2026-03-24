<template>
  <VcWidgetSkeleton v-if="loading" head size="lg" />

  <VPMarkdown v-else-if="markdownContent" :content="markdownContent" />

  <StaticPage v-else-if="pageExists" />

  <NotFound v-else-if="pageExists === false" />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Logger } from "@/core/utilities";
import { isMarkdownWithFrontmatter } from "@/core/utilities/common";
import { useStaticPage } from "@/shared/static-content";
import { usePreviewBuilderPage } from "../composables";
import { getPreviewPageId } from "../utils";
import NotFound from "@/pages/404.vue";
import VPMarkdown from "@/pages/matcher/virto-pages/vp-markdown.vue";
import StaticPage from "@/pages/static-page.vue";

const pageExists = ref<boolean | null>(null);
const markdownContent = ref<string | null>(null);

const { loading, loadPreviewPage } = usePreviewBuilderPage();
const { staticPagePreview: template } = useStaticPage();

onMounted(async () => {
  try {
    const pageId = getPreviewPageId();
    if (pageId == null) {
      pageExists.value = false;
      return;
    }
    template.value = undefined;
    const result = await loadPreviewPage(pageId);
    if (result && result.builderPage && typeof result.builderPage.content === "string") {
      const content = result.builderPage.content;
      if (isMarkdownWithFrontmatter(content)) {
        markdownContent.value = content;
      } else {
        try {
          template.value = JSON.parse(content);
        } catch (e) {
          Logger.info("Error parsing page content:", e, content);
        }
      }
    }
    pageExists.value = !!template.value || !!markdownContent.value;
  } catch (error) {
    Logger.error("Error loading preview page:", error);
    pageExists.value = false;
  }
});
</script>
