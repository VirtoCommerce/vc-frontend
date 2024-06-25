<template>
  <component :is="page" />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import type { StateType } from "@/pages/matcher/priorityManager";
interface IEmits {
  (event: "setState", value: StateType): void;
}

const emit = defineEmits<IEmits>();

const pages = {
  "/": defineAsyncComponent(() => import("@/pages/home.vue")),
  "/demo-landing": defineAsyncComponent(() => import("@/pages/demo-landing.vue")),
} as const;

const page = computed(() => {
  const path = window.location.pathname;
  if (Object.keys(pages).includes(path)) {
    emit("setState", "ready");

    return pages[path as keyof typeof pages];
  }

  emit("setState", "empty");
  return null;
});
</script>

<style scoped lang="scss"></style>
