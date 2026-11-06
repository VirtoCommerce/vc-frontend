<template>
  <PageTemplate
    v-if="pageBuilderContent"
    :page-settings="pageBuilderContent.settings"
    :permalink="permalink"
    object-type="Pages"
  >
    <div
      v-if="!pageBuilderContent.settings?.hideBreadcrumbs || pageBuilderContent.settings?.header"
      class="mx-auto mt-7 w-full max-w-screen-2xl px-5 pb-5 md:px-12 lg:pb-10"
    >
      <VcBreadcrumbs v-if="!pageBuilderContent.settings?.hideBreadcrumbs" class="mb-3" :items="breadcrumbs">
      </VcBreadcrumbs>

      <VcTypography v-if="pageBuilderContent.settings?.header" tag="h1">
        {{ pageBuilderContent.settings.header }}
      </VcTypography>
    </div>

    <template v-for="item in pageBuilderContent.content">
      <PageBuilderSection
        v-if="!item.hidden"
        :key="item.id"
        :item="item"
        :id="getAnchorId(item)"
        :context="sectionContext"
      />
    </template>
  </PageTemplate>
</template>

<script setup lang="ts">
import { computed, shallowRef, unref, watch } from "vue";
import { useBreadcrumbs } from "@/core/composables";
import { isRecord, Logger } from "@/core/utilities";
import { humanizeName } from "@/core/utilities/common";
import { usePageLayout } from "@/shared/layout/composables/usePageLayout";
import { getAnchorId, PageBuilderSection, PageTemplate, useAnchorScroll } from "@/shared/static-content";

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
const breadcrumbs = useBreadcrumbs(() => [{ title: templateName.value }] as IBreadcrumb[]);
const pageBuilderContent = shallowRef<IPageBuilderContent | null>(null);

/** The page's settings, for the sections that declare them. */
const sectionContext = computed(() => ({ settings: pageBuilderContent.value?.settings }));
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
