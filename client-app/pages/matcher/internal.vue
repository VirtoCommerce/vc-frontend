<template>
  <component :is="page" v-show="isVisible" />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import type { StateType } from "@/pages/matcher/priorityManager";

interface IProps {
  isVisible?: boolean;
}

interface IEmits {
  (event: "setState", value: StateType): void;
}

const emit = defineEmits<IEmits>();
defineProps<IProps>();

const pages = {
  "/": defineAsyncComponent(() => import("@/pages/home.vue")),
  "/demo-landing": defineAsyncComponent(() => import("@/pages/demo-landing.vue")),
} as const;

const route = useRoute();
const page = computed(() => {
  if (Object.keys(pages).includes(route.path)) {
    emit("setState", "ready");
    return pages[route.path as keyof typeof pages];
  }

  emit("setState", "empty");
  return null;
});

onBeforeUnmount(() => {
  emit("setState", "initial");
});
</script>
