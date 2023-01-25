<template>
  <div class="flex items-center text-vendor">
    <svg height="16" width="16">
      <use href="/static/icons/vendor.svg#icon"></use>
    </svg>
    <span class="ml-1.5 font-bold uppercase text-16 md:leading-5"
      >{{ $t("common.labels.vendor") }}: {{ value?.name }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { Vendor } from "@/xapi/types";
import { PropType } from "vue";

defineProps({
  value: {
    type: Object as PropType<Vendor>,
    default: undefined,
  },
});
</script>
