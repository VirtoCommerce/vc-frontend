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
import { onBeforeMount, shallowRef, computed, unref } from "vue";
import { useBreadcrumbs } from "@/core/composables";
import { getBlockType } from "@/plugins/builder-preview/block-mapping";

interface IProps {
  content?: string;
}

type BlockType = {
  type: string;
  [key: string]: unknown;
};

interface IPageBuilderContent {
  settings: BlockType;
  content: BlockType[];
}

const props = defineProps<IProps>();

const templateName = computed(
  () => unref(pageBuilderContent)?.settings?.name || unref(pageBuilderContent)?.settings?.header || "",
);
const breadcrumbs = useBreadcrumbs(() => [{ title: templateName.value }] as IBreadcrumb[]);
const canShowContent = shallowRef(false);
const pageBuilderContent = shallowRef<IPageBuilderContent | null>(null);

function clearState() {
  pageBuilderContent.value = null;
  canShowContent.value = false;
}

onBeforeMount(() => {
  if (props.content) {
    trySetContent();
  } else {
    clearState();
  }
});

function trySetContent() {
  if (!props.content) {
    return;
  }
  const blocks = <IPageBuilderContent>JSON.parse(props.content);
  pageBuilderContent.value = blocks;
  canShowContent.value = true;
}
</script>
