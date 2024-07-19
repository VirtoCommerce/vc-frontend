<template>
  <div>
    <SlugContent
      v-if="previewers.slugContent.isActive"
      v-show="visibleComponent === 'slugContent'"
      :path-match="pathMatch"
      @set-state="updateState($event, 'slugContent')"
    />
    <BuilderIo
      v-if="previewers.builderIo.isActive"
      v-show="visibleComponent === 'builderIo'"
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
import { computed, defineAsyncComponent, ref } from "vue";
import { useThemeContext } from "@/core/composables";
import { getVisiblePreviewer } from "./priorityManager";
import type { StateType, PreviewerStateType } from "./priorityManager";
import NotFound from "@/pages/404.vue";

interface IProps {
  pathMatch?: string[];
}

defineProps<IProps>();

const BuilderIo = defineAsyncComponent(() => import("@/pages/matcher/builderIo/builder-io.vue"));
const SlugContent = defineAsyncComponent(() => import("@/pages/matcher/slug-content.vue"));
const Internal = defineAsyncComponent(() => import("@/pages/matcher/internal.vue"));

const { modulesSettings } = useThemeContext();

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
    priority: 1,
    state: "initial",
    isActive: isBuilderIOEnabled.value,
  },
  slugContent: {
    id: "slugContent",
    priority: 2,
    state: "initial",
    isActive: true,
  },
  internal: {
    id: "internal",
    priority: 3,
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
</script>
