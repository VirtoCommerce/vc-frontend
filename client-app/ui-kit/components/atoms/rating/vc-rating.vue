<template>
  <div class="flex flex-row items-center gap-[0.219rem]">
    <svg height="14" width="14" class="text-primary">
      <use href="/static/images/star.svg#main"></use>
    </svg>
    <div class="text-13 leading-[0.875rem] font-semibold">
      <span class="font-extrabold">{{ value?.value }}</span>
      /5&nbsp;({{ value?.reviewCount }})
    </div>
  </div>
</template>

<script setup lang="ts">
import { Rating } from "@/xapi/types";
import { PropType } from "vue";

defineProps({
  value: {
    type: Object as PropType<Rating>,
    default: undefined,
  },
});
</script>
