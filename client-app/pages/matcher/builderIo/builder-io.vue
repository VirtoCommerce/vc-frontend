<template>
  <div v-if="isVisible && canShowContent" ref="builderIoAnchor">
    <Content model="page" :content="content" :api-key="apiKey" :custom-components="getRegisteredComponents()" />
  </div>
</template>

<script setup lang="ts">
import { Content, fetchOneEntry, getBuilderSearchParams, isPreviewing } from "@builder.io/sdk-vue";
import { useSeoMeta } from "@unhead/vue";
import { useElementVisibility } from "@vueuse/core";
import { computed, onMounted, ref, shallowRef } from "vue";
import { onBeforeRouteUpdate } from "vue-router";
import { usePageTitle } from "@/core/composables";
import { builderIOComponents } from "./customComponents";
import type { StateType } from "../priorityManager";
import type { BuilderContent } from "@builder.io/sdk-vue";

interface IEmits {
  (event: "setState", value: StateType): void;
}

interface IProps {
  apiKey?: string;
  isVisible?: boolean;
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

const canShowContent = ref(false);
const content = ref<BuilderContent | null>(null);
const isLoading = ref(false);

function clearState() {
  content.value = null;
  canShowContent.value = false;
  isLoading.value = false;
}

onMounted(() => {
  void tryLoadContent(window.location.pathname);
});

onBeforeRouteUpdate((to, from) => {
  if (to.path !== from.path) {
    clearState();
    void tryLoadContent(to.path);
  }
});

async function tryLoadContent(urlPath: string) {
  if (props.apiKey) {
    isLoading.value = true;

    emit("setState", "loading");

    content.value = await fetchOneEntry({
      model: "page",
      apiKey: props.apiKey,
      options: getBuilderSearchParams(new URLSearchParams(location.search)),
      userAttributes: {
        urlPath,
      },
    });

    isLoading.value = false;

    canShowContent.value = !!content.value || isPreviewing();

    if (canShowContent.value) {
      emit("setState", "ready");
    } else {
      emit("setState", "empty");
    }
  }
}

const builderIoAnchor = shallowRef<HTMLElement | null>(null);
const builderIoAnchorIsVisible = useElementVisibility(builderIoAnchor);

const canSetMeta = computed(() => !!builderIoAnchorIsVisible.value && !!content.value?.data);
const pageTitle = computed(() => usePageTitle(content.value?.data?.title).title.value ?? "");

useSeoMeta({
  title: () => (canSetMeta.value ? pageTitle.value : undefined),
  keywords: () => (canSetMeta.value ? (content.value?.data?.keywords as string) : undefined),
  description: () => (canSetMeta.value ? (content.value?.data?.description as string) : undefined),
});

const getRegisteredComponents = () => {
  return builderIOComponents;
};
</script>
