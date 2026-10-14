<template>
  <div>
    <VPPageBuilder v-if="isPageBuilderContent" :content="pageDocument?.content" :name="liveName" />

    <VPBuilderIO v-if="isBulderIOContent" :content="pageDocument?.content" />
  </div>
</template>

<script setup lang="ts">
import { useHead } from "@unhead/vue";
import { computed, watch } from "vue";
import { useLanguages } from "@/core/composables/useLanguages";
import { buildAlternateLinks } from "@/pages/matcher/virto-pages/alternate-links";
import VPBuilderIO from "@/pages/matcher/virto-pages/vp-builder-io.vue";
import VPPageBuilder from "@/pages/matcher/virto-pages/vp-page-builder.vue";

interface IProps {
  pageDocument: {
    id: string;
    source?: string;
    permalink?: string;
    content: string;
    alternates?: { cultureName: string; permalink: string }[];
  } | null;
}

const props = defineProps<IProps>();

const isBulderIOContent = computed(() => {
  return props.pageDocument?.source === "builder.io";
});

const isPageBuilderContent = computed(() => {
  return props.pageDocument?.source === "page-builder";
});

const permalink = computed(() => {
  return props.pageDocument?.permalink;
});

// VCST-5274: the page document's baked `settings.name` is never updated on rename, so derive
// the breadcrumb leaf from the live permalink (its last segment) instead of the stored name.
const liveName = computed(() => permalink.value?.split("/").filter(Boolean).pop());

const { updateLocalizedUrl, getLocalizedPath, defaultStoreCulture } = useLanguages();

watch(permalink, () => {
  updateLocalizedUrl(permalink.value);
});

// Translations of the page for search engines (hreflang) when it is published in several languages.
useHead({
  link: () =>
    buildAlternateLinks(
      props.pageDocument?.alternates ?? [],
      location.origin,
      defaultStoreCulture.value,
      getLocalizedPath,
    ),
});
</script>
