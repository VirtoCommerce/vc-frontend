<template>
  <div v-if="canShowContent">
    <Content model="page" :content="content" :api-key="apiKey" :custom-components="getRegisteredComponents()" />
  </div>
</template>

<script setup lang="ts">
import { Content, fetchOneEntry, getBuilderSearchParams, isPreviewing } from "@builder.io/sdk-vue";
import { onMounted, ref, shallowRef } from "vue";
import { onBeforeRouteUpdate } from "vue-router";
import { IS_DEVELOPMENT } from "@/core/constants";
import { builderIOComponents } from "@/shared/static-content";
import type { StateType } from "./priorityManager";

interface IEmits {
  (event: "setState", value: StateType): void;
}

interface IProps {
  apiKey?: string;
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

const canShowContent = shallowRef(false);
const content = shallowRef();
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

const getRegisteredComponents = () => {
  return builderIOComponents;
};
</script>
