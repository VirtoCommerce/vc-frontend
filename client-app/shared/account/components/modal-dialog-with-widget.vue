<template>
  <VcModal max-width="1182px" title="Broken scroll issue" dividers is-persistent is-mobile-fullscreen>
    <div class="z-10 space-y-5 scroll-smooth sm:mx-auto md:space-y-6">
      <div v-for="(item, index) in dataBlocks" :key="index">
        <VcWidget class="md:mx-6" collapsible :shadow="false" size="md">
          <template #header-container>
            <span class="vc-widget__header">
              <span class="vc-widget__title">
                <VcTypography tag="h2" variant="h3">
                  {{ item.title }}
                </VcTypography>
              </span>
              <span class="vc-widget__prepend-append">
                <VcIcon name="chevron-down" size="sm" />
              </span>
            </span>
          </template>

          <div class="flex flex-wrap items-center justify-between md:justify-end">
            <div class="flex flex-col">
              <div class="flex flex-row items-center justify-start">
                <p v-html-safe="item.text" class="mr-6 w-full text-xxs font-medium leading-snug text-secondary-900" />
              </div>
            </div>
          </div>
          <template #footer-container>
            <VcCheckbox class="bg-neutral-50 p-6">
              <span class="text-12 font-medium text-neutral-900"> checkbox </span>
            </VcCheckbox>
          </template>
        </VcWidget>
      </div>
    </div>

    <template #actions="{ close }">
      <!-- Step 1: Actions -->
      <template>
        <div class="flex" :class="[isMobile ? 'w-1/2 grow' : 'w-full justify-between']">
          <VcButton size="md" class="flex-end ml-auto flex px-10 md:mx-auto md:mr-10"> agree </VcButton>
        </div>
      </template>
    </template>
  </VcModal>
</template>

<script setup lang="ts">
import { breakpointsTailwind, useBreakpoints } from "@vueuse/core";
import { ref } from "vue";
import { testData } from "@/assets/test-data";

export interface IEmits {
  (event: "close"): void;
}

import { VcModal, VcButton } from "@/ui-kit/components";

const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("lg");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const dataBlocks = ref<any[]>(testData);
</script>
