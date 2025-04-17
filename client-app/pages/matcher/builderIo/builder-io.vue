<template>
  <div v-if="isVisible && canShowContent" ref="builderIoAnchor">
    <Content model="page" :content="content" :api-key="apiKey" :custom-components="getRegisteredComponents()" />
  </div>
</template>

<script setup lang="ts">
import { Content, fetchOneEntry, getBuilderSearchParams, isPreviewing } from "@builder.io/sdk-vue";
import { useSeoMeta } from "@unhead/vue";
import { useElementVisibility } from "@vueuse/core";
import { onMounted, ref, shallowRef, watchEffect } from "vue";
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

type MetaDataType = { title?: string; keywords?: string; description?: string };
const seoMeta = useSeoMeta({});

watchEffect(() => {
  const data: MetaDataType | undefined = content.value?.data;

  if (data && builderIoAnchorIsVisible.value && seoMeta) {
    const { title, keywords, description } = data;
    const { title: pageTitle } = usePageTitle(title);

    seoMeta.patch({
      title: pageTitle.value,
      keywords,
      description,
    });
  }
});

const getRegisteredComponents = () => {
  return builderIOComponents;
};
</script>
