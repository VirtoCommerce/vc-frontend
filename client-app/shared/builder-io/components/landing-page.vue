<template>
  <VcLoaderOverlay v-if="isLoading" no-bg />
  <div v-else-if="canShowContent">
    <Content model="page" :content="content" :api-key="apiKey" :custom-components="getRegisteredComponents()" />
  </div>
  <div v-else>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { Content, fetchOneEntry, getBuilderSearchParams, isPreviewing } from "@builder.io/sdk-vue";
import { computed, onMounted, ref, shallowRef } from "vue";
import { onBeforeRouteUpdate } from "vue-router";
import { useThemeContext } from "@/core/composables";
import { IS_DEVELOPMENT } from "@/core/constants";
import { builderIOComponents } from "@/shared/static-content";

const { modulesSettings } = useThemeContext();

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

const moduleSettings = computed(() => {
  return modulesSettings.value?.find((el) => el.moduleId === "VirtoCommerce.BuilderIO");
});

const apiKey = computed(() => {
  return moduleSettings.value?.settings.find((el) => el.name === "BuilderIO.PublicApiKey")?.value;
});

const isEnabled = computed(() => {
  return moduleSettings.value?.settings.find((el) => el.name === "BuilderIO.Enable")?.value;
});

async function tryLoadContent(urlPath: string) {
  if (isEnabled.value && typeof apiKey.value === "string") {
    isLoading.value = true;

    content.value = await fetchOneEntry({
      model: "page",
      cacheSeconds: IS_DEVELOPMENT ? 1 : 60,
      apiKey: apiKey.value,
      options: getBuilderSearchParams(new URLSearchParams(location.search)),
      userAttributes: {
        urlPath,
      },
    });

    isLoading.value = false;

    canShowContent.value = !!content.value || isPreviewing();
  }
}

const getRegisteredComponents = () => {
  return builderIOComponents;
};
</script>
