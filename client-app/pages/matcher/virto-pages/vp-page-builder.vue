<template>
  <PageBuilderPage
    v-if="pageBuilderContent"
    :settings="pageBuilderContent.settings"
    :content="pageBuilderContent.content"
    :title="templateName"
    :permalink="permalink"
    :object-type="PAGES_OBJECT_TYPE"
  />
</template>

<script setup lang="ts">
import { computed, shallowRef, unref, watch } from "vue";
import { isRecord, Logger } from "@/core/utilities";
import { humanizeName } from "@/core/utilities/common";
import { PAGES_OBJECT_TYPE } from "@/shared/common/constants/slug-object-types";
import { usePageLayout } from "@/shared/layout/composables/usePageLayout";
import { PageBuilderPage, useAnchorScroll, usePageSeoInfo } from "@/shared/static-content";

interface IProps {
  content?: string;
  name?: string;
  permalink?: string;
}

type BlockType = {
  id?: string;
  type: string;
  [key: string]: unknown;
};

interface IPageBuilderContent {
  settings: Record<string, unknown>;
  content: BlockType[];
}

const props = defineProps<IProps>();

const VP_PAGE_BUILDER_LOG_SCOPE = "[vp-page-builder]";

// VCST-5274: prefer the live name derived from the permalink (which follows renames) over the
// document's baked `settings.name`, which is written once at authoring time and never updated
// on rename. Humanize the result so a raw, web-safe name (underscores) is shown as a friendly label.
const templateName = computed(() =>
  humanizeName(
    props.name || unref(pageBuilderContent)?.settings?.name || unref(pageBuilderContent)?.settings?.header || "",
  ),
);
const pageBuilderContent = shallowRef<IPageBuilderContent | null>(null);

const { setPageLayout } = usePageLayout();

watch(
  () => props.content,
  (content) => {
    pageBuilderContent.value = parsePageBuilderContent(content);

    // Nothing renders the page's template then, so the header and footer must not wait for its layout.
    if (!pageBuilderContent.value) {
      setPageLayout("full");
    }
  },
  { immediate: true },
);

useAnchorScroll(() => pageBuilderContent.value);

usePageSeoInfo(() => pageBuilderContent.value?.settings.seoInfo, templateName);

function parsePageBuilderContent(content?: string): IPageBuilderContent | null {
  let parsedContent: IPageBuilderContent | null = null;

  if (content) {
    try {
      const value: unknown = JSON.parse(content);
      if (
        isRecord(value) &&
        isRecord(value.settings) &&
        Array.isArray(value.content) &&
        value.content.every(isPageBuilderBlock)
      ) {
        parsedContent = { settings: value.settings, content: value.content };
      } else {
        Logger.warn(`${VP_PAGE_BUILDER_LOG_SCOPE} Ignored a page document that is not Page Builder content`);
      }
    } catch (error) {
      // A cache-and-network update can temporarily replace the document. Do not keep rendering the
      // previous page when the latest payload is empty or malformed.
      Logger.warn(`${VP_PAGE_BUILDER_LOG_SCOPE} Ignored a page document that is not valid JSON`, error);
    }
  }

  return parsedContent;
}

function isPageBuilderBlock(value: unknown): value is BlockType {
  return isRecord(value) && typeof value.type === "string";
}
</script>
