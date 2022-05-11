<template>
  <div></div>
</template>

<script setup lang="ts">
import { IBreadcrumbs } from "@/components/types";
import { PropType } from "vue";

defineProps({
  title: {
    type: String,
    default: "",
  },

  description: {
    type: String,
    default: "",
  },

  image: {
    type: String,
    default: "",
  },

  breadcrumbs: {
    type: Array as PropType<IBreadcrumbs[]>,
    default: null,
  },
});
</script>
