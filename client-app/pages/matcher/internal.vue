<template>
  <component :is="page" v-if="isVisible" />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted } from "vue";
import { onBeforeRouteUpdate, useRoute } from "vue-router";
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
    return pages[route.path as keyof typeof pages];
  }
  return null;
});

onMounted(() => {
  if (!Object.keys(pages).includes(route.path)) {
    emit("setState", "empty");
  } else {
    emit("setState", "ready");
  }
});

onBeforeRouteUpdate((to) => {
  if (Object.keys(pages).includes(to.path)) {
    emit("setState", "ready");
  } else {
    emit("setState", "empty");
  }
});

onBeforeUnmount(() => {
  emit("setState", "initial");
});
</script>
