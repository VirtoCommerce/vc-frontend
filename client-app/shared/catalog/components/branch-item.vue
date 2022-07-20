<template>
  <div class="flex items-center pt-3 pb-1.5 px-4 first:border-t-transparent border-t">
    <div class="flex-grow flex items-start">
      <div class="relative cursor-pointer" @click="$emit('check')">
        <VcCheckbox v-model="branch.checked"> </VcCheckbox>
        <div class="absolute inset-0"></div>
      </div>
      <div class="relative flex-grow ml-3 -mt-1" :class="{ 'h-[3.75rem]': isTextTruncateEnabled }">
        <div class="pr-3" :class="{ 'absolute inset-0': isTextTruncateEnabled }">
          <div :class="{ 'truncate max-w-full': isTextTruncateEnabled }">
            <a href="#" class="mt-px text-base font-extrabold text-[color:var(--color-link)]">
              {{ branch.name }}
            </a>
          </div>
          <div class="pt-px text-xs" :class="{ 'line-clamp-2': isTextTruncateEnabled }">
            {{ branch.address }}
          </div>
        </div>
      </div>
    </div>
    <div class="flex items-start -mt-0.5">
      <svg class="mt-0.5 text-[color:var(--color-branch-dialog-clock)]" width="16" height="16">
        <use href="/static/images/clock.svg#main"></use>
      </svg>
      <div class="ml-1 text-xs branch-table">
        <table>
          <tr>
            <td><b>Mon-Fri:</b></td>
            <td>7:30 <sup>AM</sup>-5:00 <sup>PM</sup></td>
          </tr>
          <tr>
            <td><b class="closed">Sat-Sun:</b></td>
            <td>Closed</td>
          </tr>
        </table>
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
defineEmits(["check"]);
</script>
<style lang="scss">
.branch-table {
  table {
    @apply border-collapse;
  }
  td {
    @apply px-px py-0 whitespace-nowrap;

    &:first-child {
      @apply text-right;
    }
  }
  .closed {
    @apply text-[color:var(--color-branch-dialog-closed)];
  }
}
</style>
