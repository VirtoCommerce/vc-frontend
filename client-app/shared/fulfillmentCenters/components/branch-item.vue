<template>
  <div class="border-t px-5 py-4 first:border-t-transparent sm:px-4 sm:pb-1.5 sm:pt-3">
    <div class="flex grow items-start">
      <slot></slot>

      <div class="grow items-center md:flex">
        <div class="relative -mt-0.5 grow md:-mt-1">
          <div class="pr-3">
            <div :class="{ 'max-w-full truncate': isTextTruncateEnabled }">
              <a :href="`/branch/${branch.id}`" target="_blank" class="mt-px text-base font-black text-[--link-color]">
                {{ branch.name }}
              </a>
            </div>

            <div class="line-clamp-1 pt-px text-xs" :title="branch.address">
              {{ branch.address }}
            </div>
          </div>
        </div>

        <div v-if="branch.shortDescription" class="mt-2 flex items-start md:-mt-0.5">
          <svg class="text-secondary md:mt-px" width="16" height="16">
            <use href="/static/images/clock.svg#main"></use>
          </svg>
          <div
            v-html-safe="branch.shortDescription"
            class="ml-1.5 flex space-x-3 whitespace-nowrap text-xs md:block md:space-x-0"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IFulfillmentCenter } from "@/shared/fulfillmentCenters";
import type { PropType } from "vue";

defineProps({
  branch: {
    type: Object as PropType<IFulfillmentCenter>,
    required: true,
  },

  isTextTruncateEnabled: {
    type: Boolean,
    default: false,
  },
});
</script>
