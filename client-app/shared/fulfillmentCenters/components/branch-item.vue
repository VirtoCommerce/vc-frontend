<template>
  <div class="border-t border-neutral-200 px-5 py-4 first:border-t-transparent sm:px-4 sm:pb-2.5 sm:pt-3">
    <div class="flex grow items-start">
      <slot></slot>

      <div class="min-w-0 grow items-center md:flex">
        <div class="relative -mt-0.5 min-w-0 grow md:-mt-1">
          <div class="pr-3">
            <div :class="{ 'max-w-full truncate': isTextTruncateEnabled }">
              <a
                :href="`/branch/${branch.id}`"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-px text-base font-black text-[--link-color]"
              >
                {{ branch.name }}
              </a>
            </div>

            <div class="line-clamp-1 pt-px text-xs" :title="branch.address">
              {{ branch.address }}
            </div>
          </div>
        </div>

        <div v-if="branch.shortDescription" class="mt-2 flex min-w-0 items-start md:-mt-0.5 md:max-w-[50%] md:shrink-0">
          <VcIcon name="clock" class="text-secondary md:mt-px" :size="16" />

          <div
            v-html-safe="branch.shortDescription"
            class="ml-1.5 flex min-w-0 space-x-3 whitespace-nowrap text-xs md:block md:space-x-0 md:truncate"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IFulfillmentCenter } from "@/shared/fulfillmentCenters";

interface IProps {
  branch: IFulfillmentCenter;
  isTextTruncateEnabled?: boolean;
}

defineProps<IProps>();
</script>
