<template>
  <Error404 v-if="isGone" />

  <div v-else class="plugin-route-placeholder" role="status" aria-busy="true">
    <VcLoader />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { PLACEHOLDER_META_KEY } from "./declare";
import { whenPluginSettled } from "./status";

const Error404 = defineAsyncComponent(() => import("@/pages/404.vue"));

const route = useRoute();
const router = useRouter();
const isGone = ref(false);

/**
 * Stands in for a declared route until its plugin settles, rendered inside the parent's layout and
 * guards. Then the same URL is resolved again: the plugin's own record has replaced this one, or
 * the host withdrew it and the page is the host's not-found page — never an endless loader.
 */
onMounted(async () => {
  const plugin = route.meta[PLACEHOLDER_META_KEY];
  if (typeof plugin !== "string") {
    isGone.value = true;
    return;
  }
  const { fullPath, name, path, query, hash } = route;
  await whenPluginSettled(plugin);
  if (router.currentRoute.value.fullPath !== fullPath) {
    return;
  }
  const next = router.resolve(fullPath);
  if (next.name === name && next.matched.at(-1)?.meta[PLACEHOLDER_META_KEY] === undefined) {
    await router.replace({ path, query, hash, force: true });
    return;
  }
  isGone.value = true;
});
</script>

<style lang="scss">
.plugin-route-placeholder {
  @apply flex min-h-64 items-center justify-center;
}
</style>
