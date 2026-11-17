<template>
  <PageTemplate :page-settings="settings" :permalink="permalink" :object-type="objectType">
    <div
      v-if="!settings?.hideBreadcrumbs || settings?.header"
      class="mx-auto mt-7 w-full max-w-screen-2xl px-5 pb-5 md:px-12 lg:pb-10"
    >
      <VcBreadcrumbs v-if="!settings?.hideBreadcrumbs" class="mb-3" :items="breadcrumbs"></VcBreadcrumbs>

      <VcTypography v-if="settings?.header" tag="h1">
        {{ settings.header }}
      </VcTypography>
    </div>

    <template v-for="item in content">
      <PageBuilderSection
        v-if="!item.hidden"
        :key="item.id"
        :item="item"
        :id="getAnchorId(item)"
        :context="sectionContext"
      />
    </template>
  </PageTemplate>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useBreadcrumbs } from "@/core/composables";
import { getAnchorId } from "../anchors";
import PageBuilderSection from "./page-builder-section.vue";
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
