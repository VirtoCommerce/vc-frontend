<template>
  <component :is="page" v-if="isVisible" />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted } from "vue";
import { onBeforeRouteUpdate, useRoute } from "vue-router";
import type { StateType, UpdateStateEventArgs } from "@/pages/matcher/priorityManager";

interface IProps {
  isVisible?: boolean;
}

interface IEmits {
  (event: "setState", value: UpdateStateEventArgs): void;
}

const emit = defineEmits<IEmits>();
defineProps<IProps>();

const route = useRoute();

const localeParam = route.params.locale as string;

const pages = {
  [`/${localeParam}`]: defineAsyncComponent(() => import("@/pages/home.vue")),
  [`/${localeParam}/demo-landing`]: defineAsyncComponent(() => import("@/pages/demo-landing.vue")),
} as const;

const page = computed(() => {
  if (Object.keys(pages).includes(route.path)) {
    return pages[route.path as keyof typeof pages];
  }
  return null;
});

function emitState(state: StateType) {
  emit("setState", { state });
}

onMounted(() => {
  if (!Object.keys(pages).includes(route.path)) {
    emitState("empty");
  } else {
    emitState("ready");
  }
});

onBeforeRouteUpdate((to) => {
  if (Object.keys(pages).includes(to.path)) {
    emitState("ready");
  } else {
    emitState("empty");
  }
});

onBeforeUnmount(() => {
  emitState("initial");
});
</script>
