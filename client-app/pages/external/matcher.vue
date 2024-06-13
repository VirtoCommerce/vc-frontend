<template>
  <div>
    <SlugContent
      v-if="previewers.slugContent.isActive"
      v-show="visibleComponent === 'slugContent'"
      :seo-url="seoUrl"
      @set-state="updateState($event, 'slugContent')"
    />
    <BuilderIo
      v-if="previewers.builderIo.isActive"
      v-show="visibleComponent === 'builderIo'"
      :api-key="builderIoApiKey"
      @set-state="updateState($event, 'builderIo')"
    />
    <div v-if="visibleComponent === 'loader'" class="min-h-[80vh]">
      <VcLoaderOverlay />
    </div>
    <NotFound v-show="!visibleComponent" />
  </div>
</template>

<script setup lang="ts">
import { computedEager } from "@vueuse/core";
import { computed, ref } from "vue";
import { useThemeContext } from "@/core/composables";
import { getVisiblePreviewer } from "./priorityManager";
import type { StateType, PreviewerStateType } from "./priorityManager";
import NotFound from "@/pages/404.vue";
import BuilderIo from "@/pages/external/builder-io.vue";
import SlugContent from "@/pages/external/slug-content.vue";
const props = withDefaults(defineProps<IProps>(), {
  pathMatch: () => [],
});

const { modulesSettings } = useThemeContext();

interface IProps {
  pathMatch?: string[];
}

const seoUrl = computedEager(() => {
  // Because URL `/printers/` is an array of paths ["printers", ""], empty paths must be removed.
  const paths = props.pathMatch.filter(Boolean);
  return paths.join("/");
});

const moduleSettings = computed(() => {
  return modulesSettings.value?.find((el) => el.moduleId === "VirtoCommerce.BuilderIO");
});

const isBuilderIOEnabled = computed(() => {
  return moduleSettings.value?.settings.find((el) => el.name === "BuilderIO.Enable")?.value as boolean;
});

const builderIoApiKey = computed(() => {
  return moduleSettings.value?.settings.find((el) => el.name === "BuilderIO.PublicApiKey")?.value as string;
});

// The highest priority has the previewer whose 'priority' value is closer to zero
const previewers = ref<{ [key in string]: PreviewerStateType }>({
  slugContent: {
    id: "slugContent",
    priority: 2,
    state: "initial",
    isActive: true,
  },
  builderIo: {
    id: "builderIo",
    priority: 1,
    state: "initial",
    isActive: isBuilderIOEnabled.value,
  },
});

const visibleComponent = computed(() => getVisiblePreviewer(Object.values(previewers.value)));

function updateState(state: StateType, previewerId: PreviewerStateType["id"]) {
  if (previewers.value[previewerId]) {
    previewers.value[previewerId].state = state;
  }
}
</script>
