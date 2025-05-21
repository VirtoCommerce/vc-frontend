<template>
  <div v-if="content">
    <Content
      model="page"
      :content="pageDocumentContent"
      :api-key="builderIoApiKey"
      :custom-components="getRegisteredComponents()"
    />
  </div>
</template>

<script setup lang="ts">
import { Content } from "@builder.io/sdk-vue";
import { shallowRef, computed, watch, onBeforeMount } from "vue";
import { onBeforeRouteUpdate } from "vue-router";
import { useThemeContext } from "@/core/composables";
import { builderIOComponents } from "../builderIo/customComponents";
import type { BuilderBlock, BuilderContent } from "@builder.io/sdk-vue";

interface IProps {
  content?: string;
}

const props = defineProps<IProps>();

const { modulesSettings } = useThemeContext();

const moduleSettings = computed(() => {
  return modulesSettings.value?.find((el) => el.moduleId === "VirtoCommerce.BuilderIO");
});

const builderIoApiKey = computed(() => {
  return (
    (moduleSettings.value?.settings.find((el) => el.name === "BuilderIO.PublicApiKey")?.value as string) || "NO_KEY"
  ); // that's enought to display page
});

const canShowContent = shallowRef(false);
const pageDocumentContent = shallowRef<BuilderContent | null>(null);

function clearState() {
  pageDocumentContent.value = null;
  canShowContent.value = false;
}

watch(props, () => {
  trySetContent();
});

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
  const blocks = <BuilderBlock[]>JSON.parse(props.content);
  pageDocumentContent.value = <BuilderContent>{ data: { blocks } };
  canShowContent.value = true;
}

onBeforeRouteUpdate((to, from) => {
  if (to.path !== from.path) {
    clearState();
    trySetContent();
  }
});

const getRegisteredComponents = () => {
  return builderIOComponents;
};
</script>
