<template>
  <div v-if="content">
    <Content
      model="page"
      :content="pageDocumentContent"
      :api-key="builderIoApiKey"
      :custom-components="getRegisteredComponents()" />
  </div>
</template>

<script setup lang="ts">
import { Content } from "@builder.io/sdk-vue";
import { shallowRef, computed, watch, onBeforeMount } from "vue";
import { onBeforeRouteUpdate } from "vue-router";
import { builderIOComponents } from "../builderIo/customComponents";
import type { BuilderBlock, BuilderContent } from "@builder.io/sdk-vue";

interface IProps {
  content?: string;
}

const props = defineProps<IProps>();

const builderIoApiKey = computed(() => {
  return 'd9eda59fb24050a3cec8ccc7fc01d5c9'; // it is a fake key
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
