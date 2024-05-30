<template>
  <div>
    <div class="max-w-screen-2xl px-5 pt-7 md:px-12">
      <VcBreadcrumbs v-if="breadcrumbs?.length" :items="breadcrumbs" class="mb-3" />

      <slot name="title">
        <VcTypography v-if="title" tag="h1" class="mb-8">
          {{ title }}
        </VcTypography>
      </slot>
    </div>

    <TwoColumn class="max-w-screen-xl">
      <template #left>
        <div class="flex h-full flex-col items-center justify-center lg:items-start">
          <VcImage
            v-if="mobileImage"
            :src="mobileImage"
            :alt="$t('common.labels.background_image')"
            class="mb-8 lg:hidden"
            lazy
          />

          <slot name="description">
            <VcTypography tag="h2" class="mb-8 text-center lg:text-left">
              {{ description }}
            </VcTypography>
          </slot>

          <slot name="actions" />
        </div>
      </template>

      <template #right>
        <VcImage alt="$t('common.labels.background_image')" class="max-w-md" :src="image" lazy />
      </template>
    </TwoColumn>
  </div>
</template>

<script setup lang="ts">
import { TwoColumn } from "@/shared/layout";

export interface IProps {
  title?: string;
  description?: string;
  image?: string;
  mobileImage?: string;
  breadcrumbs?: IBreadcrumb[];
}

defineProps<IProps>();
</script>
