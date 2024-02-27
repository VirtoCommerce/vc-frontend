<template>
  <div>
    <div class="max-w-screen-2xl px-5 pt-7 md:px-12">
      <VcBreadcrumbs v-if="breadcrumbs?.length" :items="breadcrumbs" class="mb-3" />

      <slot name="title">
        <h1 v-if="title" class="text-black-800 mb-8 text-2xl font-bold uppercase md:text-4xl">
          {{ title }}
        </h1>
      </slot>
    </div>

    <TwoColumn class="max-w-screen-xl">
      <template #left>
        <div class="flex h-full flex-col items-center justify-center lg:items-start">
          <VcImage v-if="mobileImage" :src="mobileImage" class="mb-8 lg:hidden" lazy />

          <slot name="description">
            <h2 class="text-black-800 mb-8 text-center text-2xl font-semibold lg:text-left">
              {{ description }}
            </h2>
          </slot>

          <slot name="actions" />
        </div>
      </template>

      <template #right>
        <VcImage class="max-w-md" :src="image" lazy />
      </template>
    </TwoColumn>
  </div>
</template>

<script setup lang="ts">
import TwoColumn from "@/shared/layout/components/two-column.vue";

export interface IProps {
  title?: string;
  description?: string;
  image?: string;
  mobileImage?: string;
  breadcrumbs?: IBreadcrumb[];
}

defineProps<IProps>();
</script>
