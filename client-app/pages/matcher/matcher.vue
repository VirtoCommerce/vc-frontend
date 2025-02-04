<template>
  <div class="matcher">
    <SlugContent
      v-if="previewers.slugContent.isActive"
      :is-visible="visibleComponent === 'slugContent'"
      :path-match="computedPathMatch"
      @set-state="updateState($event, 'slugContent')"
    />

    <BuilderIo
      v-if="previewers.builderIo.isActive"
      :is-visible="visibleComponent === 'builderIo'"
      :api-key="builderIoApiKey"
      @set-state="updateState($event, 'builderIo')"
    />

    <Internal
      v-if="previewers.internal.isActive"
      :is-visible="visibleComponent === 'internal'"
      @set-state="updateState($event, 'internal')"
    />

    <div v-if="visibleComponent === 'loader'">
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
  pathMatch?: string | string[];
}

const props = defineProps<IProps>();

const DEFAULT_PRIORITIES = {
  builderIo: 1,
  slugContent: 2,
  internal: 3,
};

const BuilderIo = defineAsyncComponent(() => import("@/pages/matcher/builderIo/builder-io.vue"));
const SlugContent = defineAsyncComponent(() => import("@/pages/matcher/slug-content.vue"));
const Internal = defineAsyncComponent(() => import("@/pages/matcher/internal.vue"));

const { modulesSettings, themeContext } = useThemeContext();

const PRIORITIES = computed(() => {
  return { ...DEFAULT_PRIORITIES, ...themeContext.value.settings.previewers_settings?.priorities };
});

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
    priority: PRIORITIES.value.builderIo,
    state: "initial",
    isActive: isBuilderIOEnabled.value,
  },
  slugContent: {
    id: "slugContent",
    priority: PRIORITIES.value.slugContent,
    state: "initial",
    isActive: true,
  },
  internal: {
    id: "internal",
    priority: PRIORITIES.value.internal,
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

const computedPathMatch = computed<string[]>(() => {
  if (Array.isArray(props.pathMatch)) {
    return props.pathMatch;
  }
  return ["/"];
});

watch(
  viewQueryParam,
  (value) => {
    if (value === "default") {
      // for cases when we have a custom category page with the same url as a default category page, and we want to have the opportunity to switch to the default view (eg. clicking "Show all results" button, technically by setting search query URL parameter view to "default")
      previewers.value.slugContent.priority = Math.min(...Object.values(PRIORITIES.value)) - 1;
    } else {
      previewers.value.slugContent.priority = PRIORITIES.value.slugContent;
    }
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  },
  { immediate: true },
);
</script>

<style lang="scss">
.matcher {
  @apply contents;
}
</style>
