<template>
  <div>
    <SlugContent
      v-if="previewers.slugContent.isActive"
      v-show="visibleComponent === 'slugContent'"
      :is-visible="visibleComponent === 'slugContent'"
      :path-match="pathMatch"
      @set-state="updateState($event, 'slugContent')"
    />
    <BuilderIo
      v-if="previewers.builderIo.isActive"
      v-show="visibleComponent === 'builderIo'"
      :is-visible="visibleComponent === 'builderIo'"
      :api-key="builderIoApiKey"
      @set-state="updateState($event, 'builderIo')"
    />
    <Internal
      v-if="previewers.internal.isActive"
      v-show="visibleComponent === 'internal'"
      @set-state="updateState($event, 'internal')"
    />
    <div v-if="visibleComponent === 'loader'" class="min-h-[80vh]">
      <VcLoaderOverlay />
    </div>
    <NotFound v-if="!visibleComponent" />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from "vue";
import { useThemeContext, useRouteQueryParam } from "@/core/composables";
import { getVisiblePreviewer } from "./priorityManager";
import type { StateType, PreviewerStateType } from "./priorityManager";
import NotFound from "@/pages/404.vue";

interface IProps {
  pathMatch?: string[];
}

defineProps<IProps>();

const PRIORITIES = {
  builderIo: 1,
  slugContent: 2,
  internal: 3,
};

const BuilderIo = defineAsyncComponent(() => import("@/pages/matcher/builderIo/builder-io.vue"));
const SlugContent = defineAsyncComponent(() => import("@/pages/matcher/slug-content.vue"));
const Internal = defineAsyncComponent(() => import("@/pages/matcher/internal.vue"));

const { modulesSettings } = useThemeContext();

const viewQueryParam = useRouteQueryParam<string>("view");

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
  builderIo: {
    id: "builderIo",
    priority: PRIORITIES.builderIo,
    state: "initial",
    isActive: isBuilderIOEnabled.value,
  },
  slugContent: {
    id: "slugContent",
    priority: PRIORITIES.slugContent,
    state: "initial",
    isActive: true,
  },
  internal: {
    id: "internal",
    priority: PRIORITIES.internal,
    state: "initial",
    isActive: true,
  },
});

const visibleComponent = computed(() => getVisiblePreviewer(Object.values(previewers.value)));

function updateState(state: StateType, previewerId: PreviewerStateType["id"]) {
  if (previewers.value[previewerId]) {
    previewers.value[previewerId].state = state;
  }
}

watch(
  viewQueryParam,
  (value) => {
    if (value === "default") {
      // for cases when we have a custom category page with the same url as a default category page, and we want to have the opportunity to switch to the default view (eg. clicking "Show all results" button, technically by setting search query URL parameter view to "default")
      previewers.value.slugContent.priority = Math.min(...Object.values(PRIORITIES)) - 1;
    } else {
      previewers.value.slugContent.priority = PRIORITIES.slugContent;
    }
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  },
  { immediate: true },
);
</script>
