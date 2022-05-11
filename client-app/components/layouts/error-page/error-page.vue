<template>
  <div></div>
</template>

<script setup lang="ts">
import { IBreadcrumbs } from "@/components/types";
import { PropType } from "vue";

defineProps({
  code: {
    type: Number,
    default: 500,
  },

  title: {
    type: String,
    default: "",
  },

  description: {
    type: String,
    default: "",
  },

  trace: {
    type: Object,
    default: null,
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
