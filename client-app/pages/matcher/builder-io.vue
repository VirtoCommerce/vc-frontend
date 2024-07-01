<template>
  <div v-if="canShowContent" ref="builderIoAnchor">
    <Content model="page" :content="content" :api-key="apiKey" :custom-components="getRegisteredComponents()" />
  </div>
</template>

<script setup lang="ts">
import { Content, fetchOneEntry, getBuilderSearchParams, isPreviewing } from "@builder.io/sdk-vue";
import { useElementVisibility } from "@vueuse/core";
import { onMounted, ref, shallowRef, watchEffect } from "vue";
import { onBeforeRouteUpdate } from "vue-router";
import { usePageHead } from "@/core/composables";
import { IS_DEVELOPMENT } from "@/core/constants";
import { builderIOComponents } from "@/shared/static-content";
import type { StateType } from "./priorityManager";
import type { BuilderContent } from "@builder.io/sdk-vue";

interface IEmits {
  (event: "setState", value: StateType): void;
}

interface IProps {
  apiKey?: string;
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

const canShowContent = shallowRef(false);
const content = shallowRef<BuilderContent | null>(null);
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
      cacheSeconds: IS_DEVELOPMENT ? 1 : 60,
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

watchEffect(() => {
  const data: MetaDataType | undefined = content.value?.data;

  if (data && builderIoAnchorIsVisible.value) {
    const { title, keywords, description } = data;

    usePageHead({
      title,
      meta: {
        title,
        keywords,
        description,
      },
    });
  }
});

const getRegisteredComponents = () => {
  return builderIOComponents;
};
</script>
