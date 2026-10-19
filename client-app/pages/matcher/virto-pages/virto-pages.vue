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
import { useThemeContext } from "@/core/composables/useThemeContext";
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
const { themeContext } = useThemeContext();

// Search engines get the store's own host, not the one the visitor came through (a secondary domain, a preview host).
const storeOrigin = computed(() => {
  const storeUrl = themeContext.value?.storeUrl?.trim();
  return storeUrl && /^https?:\/\//i.test(storeUrl) ? new URL(storeUrl).origin : location.origin;
});

// Immediate: the document may already be loaded on mount, e.g. the translation resolved for the previous
// language's permalink after a language switch; the URL must still move to its own permalink.
watch(
  permalink,
  () => {
    updateLocalizedUrl(permalink.value);
  },
  { immediate: true },
);

// Translations of the page for search engines (hreflang) when it is published in several languages.
useHead({
  link: () =>
    buildAlternateLinks(
      props.pageDocument?.alternates ?? [],
      storeOrigin.value,
      defaultStoreCulture.value,
      getLocalizedPath,
    ),
});
</script>
