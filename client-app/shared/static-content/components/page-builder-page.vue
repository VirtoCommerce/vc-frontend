<template>
  <div class="page-builder-page">
    <PageTemplate :page-settings="settings" :permalink="permalink" :object-type="objectType">
      <div v-if="!settings?.hideBreadcrumbs || settings?.header" class="page-builder-page__header">
        <VcBreadcrumbs
          v-if="!settings?.hideBreadcrumbs"
          class="page-builder-page__breadcrumbs"
          :items="breadcrumbs"
        ></VcBreadcrumbs>

        <VcTypography v-if="settings?.header" tag="h1">
          {{ settings.header }}
        </VcTypography>
      </div>

      <PageBuilderSections :items="content" :context="sectionContext" />
    </PageTemplate>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useBreadcrumbs } from "@/core/composables";
import PageBuilderSections from "./page-builder-sections.vue";
import PageTemplate from "./page-template.vue";

interface IProps {
  settings: Record<string, unknown>;
  content: Array<{ id?: string; [key: string]: unknown }>;
  /** The breadcrumb's leaf. */
  title: string;
  permalink?: string;
  objectType?: string;
}

const props = defineProps<IProps>();

const breadcrumbs = useBreadcrumbs(() => [{ title: props.title }] as IBreadcrumb[]);

const sectionContext = computed(() => ({ settings: props.settings }));
</script>

<style lang="scss">
.page-builder-page {
  &__header {
    @apply mx-auto mt-7 w-full max-w-screen-2xl px-5 pb-5;

    @media (width >= theme("screens.md")) {
      @apply px-12;
    }

    @media (width >= theme("screens.lg")) {
      @apply pb-10;
    }
  }

  &__breadcrumbs {
    @apply mb-3;
  }
}
</style>
