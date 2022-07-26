<template>
  <div class="pt-4 sm:pt-3 pb-4 sm:pb-1.5 px-5 sm:px-4 first:border-t-transparent border-t">
    <div class="flex-grow flex items-start">
      <slot></slot>

      <div class="flex-grow md:flex items-center">
        <div class="relative flex-grow -mt-0.5 md:-mt-1" :class="{ 'h-[3.75rem]': isTextTruncateEnabled }">
          <div class="pr-3" :class="{ 'absolute inset-0': isTextTruncateEnabled }">
            <div :class="{ 'truncate max-w-full': isTextTruncateEnabled }">
              <a
                :href="`/branch/${branch.id}`"
                target="_blank"
                class="mt-px text-base font-extrabold text-[color:var(--color-link)]"
              >
                {{ branch.name }}
              </a>
            </div>
            <div class="pt-px text-xs" :class="{ 'line-clamp-2': isTextTruncateEnabled }">
              {{ branch.address }}
            </div>
          </div>
        </div>

        <div class="flex items-start mt-2 md:-mt-0.5">
          <svg class="text-[color:var(--color-branch-dialog-clock)] md:mt-px" width="16" height="16">
            <use href="/static/images/clock.svg#main"></use>
          </svg>
          <div class="flex space-x-3 ml-1.5 text-xs whitespace-nowrap md:block md:space-x-0">
            <div><b>Mon-Fri:</b> 7:30 <sup>AM</sup>-5:00 <sup>PM</sup></div>
            <div><b class="closed">Sat-Sun:</b> Closed</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { PropType } from "vue";

const props = defineProps({
  branch: {
    type: Object as PropType<any>,
    required: true,
  },
  isTextTruncateEnabled: {
    type: Boolean,
    default: false,
  },
});
</script>
<style lang="scss">
.closed {
  @apply text-[color:var(--color-branch-dialog-closed)];
}
</style>
