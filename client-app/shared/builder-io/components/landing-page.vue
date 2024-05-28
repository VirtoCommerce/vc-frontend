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
import { useRouter } from "vue-router";
import { useThemeContext } from "@/core/composables";
import { builderIOComponents } from "@/shared/static-content";

const router = useRouter();
const { modulesSettings } = useThemeContext();
const canShowContent = shallowRef(false);
const content = shallowRef();

router.beforeEach(async (to) => {
  await tryLoadContent(to.fullPath);
});

onMounted(async () => {
  await tryLoadContent(window.location.pathname);
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

const isLoading = ref(false);

async function tryLoadContent(urlPath: string) {
  if (isEnabled.value && typeof apiKey.value === "string") {
    isLoading.value = true;

    content.value = await fetchOneEntry({
      model: "page",
      apiKey: apiKey.value,
      options: getBuilderSearchParams(new URLSearchParams(location.search)),
      userAttributes: {
        urlPath: urlPath,
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
