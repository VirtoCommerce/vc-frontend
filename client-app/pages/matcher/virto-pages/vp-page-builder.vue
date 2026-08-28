<template>
  <div v-if="pageBuilderContent">
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
      <component
        :is="getBlockType(item.type)"
        v-if="!item.hidden"
        :key="item.id"
        v-bind="item"
        :model="item"
        :settings="pageBuilderContent.settings"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, shallowRef, unref, watch } from "vue";
import { useBreadcrumbs } from "@/core/composables";
import { Logger } from "@/core/utilities";
import { humanizeName } from "@/core/utilities/common";
import { getBlockType } from "@/plugins/builder-preview/block-mapping";

interface IProps {
  content?: string;
  name?: string;
}

type BlockType = {
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

watch(
  () => props.content,
  (content) => {
    pageBuilderContent.value = parsePageBuilderContent(content);
  },
  { immediate: true },
);

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPageBuilderBlock(value: unknown): value is BlockType {
  return isRecord(value) && typeof value.type === "string";
}
</script>
