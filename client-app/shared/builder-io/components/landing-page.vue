<template>
  <div v-if="canShowContent">
    <RenderContent
      model="page"
      :content="content"
      :api-key="themeContext.settings.builderIoKey"
      :custom-components="getRegisteredComponents()"
    />
  </div>
  <div v-else>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { getContent, RenderContent, isPreviewing } from "@builder.io/sdk-vue/vue3";
import { onMounted, shallowRef } from "vue";
import { useRouter } from "vue-router";
import { useThemeContext } from "@/core/composables";
import { builderIOComponents } from "@/shared/static-content";

const router = useRouter();
const { themeContext } = useThemeContext();
const canShowContent = shallowRef(true);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const content: any = shallowRef(null);

router.beforeEach(async (to) => {
  await tryLoadContent(to.fullPath);
});

onMounted(async () => {
  await tryLoadContent(window.location.pathname);
});

async function tryLoadContent(urlPath: string) {
  const apiKey = themeContext.value.settings.builderIoKey;
  if (apiKey) {
    const result = await getContent({
      model: "page",
      apiKey: apiKey,
      userAttributes: {
        urlPath: urlPath,
      },
    });
    content.value = result;
    canShowContent.value = content.value || isPreviewing();
  } else {
    canShowContent.value = false;
  }
}

const getRegisteredComponents = () => {
  return builderIOComponents;
};
</script>
