<template>
  <div>
    <SlugContent :seo-url="seoUrl" />
    <BuilderIo />
    <NotFound />
  </div>
</template>

<script setup lang="ts">
import { computedEager } from "@vueuse/core";
import { computed, ref, watch } from "vue";
import { getVisiblePreviewer } from "./priorityManager";
import type { PreviewerStateType } from "./priorityManager";
import NotFound from "@/pages/404.vue";
import BuilderIo from "@/pages/external/builder-io.vue";
import SlugContent from "@/pages/external/slug-content.vue";

interface IProps {
  pathMatch?: string[];
}

const props = withDefaults(defineProps<IProps>(), {
  pathMatch: () => [],
});

const seoUrl = computedEager(() => {
  // Because URL `/printers/` is an array of paths ["printers", ""], empty paths must be removed.
  const paths = props.pathMatch.filter(Boolean);
  return paths.join("/");
});

const previewers = ref<{ [key in string]: PreviewerStateType }>({
  slugContent: {
    id: "slugContent",
    priority: 1,
    state: "initial",
    isActive: true,
    meta: {
      title: "",
    },
  },
  builderIo: {
    id: "builderIo",
    priority: 2,
    state: "initial",
    isActive: true,
    meta: {
      title: "",
    },
  },
});

const visibleComponent = computed(() =>
  getVisiblePreviewer(Object.keys(previewers.value).map((key) => previewers.value[key])),
);

watch(props, () => {
  console.log(visibleComponent.value);
  previewers.value.builderIo.state = "loading";
  previewers.value.slugContent.state = "loading";
});
</script>
